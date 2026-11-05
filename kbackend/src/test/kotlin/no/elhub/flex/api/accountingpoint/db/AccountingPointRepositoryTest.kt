package no.elhub.flex.api.accountingpoint.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.shared.accountingpoint.model.AccountingPoint
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.NoMatchError
import no.elhub.flex.shared.db.NotFoundError
import no.elhub.flex.testutil.uniqueGsrn
import java.util.UUID
import java.util.concurrent.atomic.AtomicLong

@Suppress("MagicNumber")
class AccountingPointRepositoryTest : FunSpec({

    val repo = AccountingPointRepositoryImpl()

    val principal = FlexPrincipal(role = "flex_internal_data", eid = "0")
    val internalDataPrincipal = FlexPrincipal.internalData

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.accounting_point, flex.substation, flex.substation_cluster CASCADE")
            }
        }
    }

    context("getAccountingPointByBusinessId") {

        test("returns the accounting point when it exists") {
            // given
            val noiseApBusinessId = uniqueGsrn()
            val targetApBusinessId = uniqueGsrn()
            insertAccountingPoint(noiseApBusinessId)
            val targetApId = insertAccountingPoint(targetApBusinessId)

            // when
            val result = with(principal) {
                repo.getAccountingPointByBusinessId(targetApBusinessId)
            }.shouldBeRight()

            // then
            result shouldBe AccountingPoint(id = targetApId, businessId = targetApBusinessId)
        }

        test("returns NotFoundError when business ID does not exist") {
            // given
            insertAccountingPoint(uniqueGsrn())

            // when
            val result = with(principal) {
                repo.getAccountingPointByBusinessId(uniqueGsrn())
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("accounting point does not exist in database")
        }
    }

    context("getCurrentAccountingPoint") {

        test("returns the accounting point for an existing CU") {
            // given
            val targetApBusinessId = uniqueGsrn()
            val targetCuBusinessId = UUID.randomUUID().toString()
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            insertControllableUnit(noiseApId, UUID.randomUUID().toString())
            val targetApId = insertAccountingPoint(targetApBusinessId)
            insertControllableUnit(targetApId, targetCuBusinessId)

            // when
            val result = with(principal) {
                repo.getCurrentAccountingPoint(targetCuBusinessId)
            }.shouldBeRight()

            // then
            result.businessId shouldBe targetApBusinessId
        }

        test("returns NotFoundError when CU does not exist") {
            // given
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            insertControllableUnit(noiseApId, UUID.randomUUID().toString())

            // when
            val result = with(principal) {
                repo.getCurrentAccountingPoint(UUID.randomUUID().toString())
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("Current accounting point not found")
        }
    }

    context("checkEndUserMatchesAccountingPoint") {

        fun pidToBirthDate(pid: String): String = pid.substring(0, 6)

        test("returns end user ID when end user matches accounting point") {
            // given
            val targetApBusinessId = uniqueGsrn()
            val targetEntityBusinessId = uniquePid()
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            linkApToEndUser(noiseApId, insertEndUserParty(uniquePid()))
            val targetApId = insertAccountingPoint(targetApBusinessId)
            val expectedEndUser = insertEndUserParty(targetEntityBusinessId)
            linkApToEndUser(targetApId, expectedEndUser)

            // when
            val result = with(principal) {
                repo.checkEndUserMatchesAccountingPoint(pidToBirthDate(targetEntityBusinessId), targetApBusinessId)
            }.shouldBeRight()

            // then
            result shouldBe expectedEndUser
        }

        test("returns NoMatchError when end user does not match accounting point") {
            // given
            val targetApBusinessId = uniqueGsrn()
            val linkedEntityBusinessId = uniquePid()
            val targetApId = insertAccountingPoint(targetApBusinessId)
            linkApToEndUser(targetApId, insertEndUserParty(linkedEntityBusinessId))
            val otherBirthDate = "170514"

            // when
            val result = with(principal) {
                repo.checkEndUserMatchesAccountingPoint(otherBirthDate, targetApBusinessId)
            }

            // then
            (result.shouldBeLeft() is NoMatchError) shouldBe true
        }

        // the SQL function does not distinguish the cases so we always return 'no match', but the following case should
        // not happen because a missing accounting point should be caught earlier in the handler (before calling this)
        test("returns NoMatchError when accounting point does not exist") {
            // given
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            linkApToEndUser(noiseApId, insertEndUserParty(uniquePid()))

            // when
            val result = with(principal) {
                repo.checkEndUserMatchesAccountingPoint(pidToBirthDate(uniquePid()), uniqueGsrn())
            }

            // then
            (result.shouldBeLeft() is NoMatchError) shouldBe true
        }
    }
})

private val pidCounter = AtomicLong(0L)
private fun uniquePid(): String = pidCounter.getAndIncrement().toString().padStart(6, '0') + "12345"

private fun insertAccountingPoint(apBusinessId: String): Long =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        val id = conn.prepareStatement("INSERT INTO flex.accounting_point (business_id) VALUES (?) RETURNING id")
            .use { stmt ->
                stmt.setString(1, apBusinessId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }
        conn.commit()
        id
    }

private fun insertControllableUnit(apId: Long, cuBusinessId: String): Long =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        val id = conn.prepareStatement(
            """
            INSERT INTO flex.controllable_unit (business_id, name, start_date, regulation_direction, maximum_active_power, accounting_point_id)
            VALUES (?::uuid, ?, current_date, 'up', 100.0, ?)
            RETURNING id
            """.trimIndent(),
        ).use { stmt ->
            stmt.setString(1, cuBusinessId)
            stmt.setString(2, "CU $cuBusinessId")
            stmt.setLong(3, apId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }
        conn.commit()
        id
    }

private fun insertEndUserParty(entityBusinessId: String): Long =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }

        val entityId = conn.prepareStatement(
            "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, 'person', ?, 'pid') RETURNING id",
        ).use { stmt ->
            stmt.setString(1, "End User $entityBusinessId")
            stmt.setString(2, entityBusinessId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }

        val partyId = conn.prepareStatement(
            "INSERT INTO flex.party (entity_id, name, type, role) VALUES (?, ?, 'end_user', 'flex_end_user') RETURNING id",
        ).use { stmt ->
            stmt.setLong(1, entityId)
            stmt.setString(2, "End User Party $entityBusinessId")
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }

        conn.prepareStatement("UPDATE flex.party SET status = 'active' WHERE id = ?").use { stmt ->
            stmt.setLong(1, partyId)
            stmt.executeUpdate()
        }

        conn.commit()
        partyId
    }

/** Inserts an organisation entity + energy_supplier party with the given GLN, activates it. Returns the party ID. */
private fun linkApToEndUser(apId: Long, euPartyId: Long) {
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        conn.prepareStatement(
            """
            INSERT INTO flex.accounting_point_end_user (accounting_point_id, end_user_id, valid_time_range)
            VALUES (?, ?, tstzrange(date_trunc('day', now() AT TIME ZONE 'Europe/Oslo') AT TIME ZONE 'Europe/Oslo', null, '[)'))
            """.trimIndent(),
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.setLong(2, euPartyId)
            stmt.executeUpdate()
        }
        conn.commit()
    }
}
