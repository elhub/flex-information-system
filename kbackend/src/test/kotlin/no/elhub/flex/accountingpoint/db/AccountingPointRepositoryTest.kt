package no.elhub.flex.accountingpoint.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.util.uniqueGsrn
import java.sql.Connection
import java.util.UUID
import java.util.concurrent.atomic.AtomicLong

@Suppress("MagicNumber")
class AccountingPointRepositoryTest : FunSpec({

    val repo = AccountingPointRepositoryImpl()

    val principal = FlexPrincipal(role = "flex_flexibility_information_system_operator", eid = "0")

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.accounting_point CASCADE")
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
            result shouldBe AccountingPoint(id = targetApId.toInt(), businessId = targetApBusinessId)
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

        test("returns end user ID when end user matches accounting point") {
            // given
            val targetApBusinessId = uniqueGsrn()
            val targetEntityBusinessId = uniquePid()
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            linkApToEndUser(noiseApId, insertEndUserParty(uniquePid()))
            val targetApId = insertAccountingPoint(targetApBusinessId)
            linkApToEndUser(targetApId, insertEndUserParty(targetEntityBusinessId))

            // when
            val result = with(principal) {
                repo.checkEndUserMatchesAccountingPoint(targetEntityBusinessId, targetApBusinessId)
            }.shouldBeRight()

            // then
            result shouldBe result
        }

        test("returns NotFoundError when end user does not match accounting point") {
            // given
            val targetApBusinessId = uniqueGsrn()
            val linkedEntityBusinessId = uniquePid()
            val otherEntityBusinessId = uniquePid()
            val targetApId = insertAccountingPoint(targetApBusinessId)
            linkApToEndUser(targetApId, insertEndUserParty(linkedEntityBusinessId))
            insertEndUserParty(otherEntityBusinessId)

            // when
            val result = with(principal) {
                repo.checkEndUserMatchesAccountingPoint(otherEntityBusinessId, targetApBusinessId)
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("end user does not match accounting point / controllable unit")
        }

        test("returns NotFoundError when accounting point does not exist") {
            // given
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            linkApToEndUser(noiseApId, insertEndUserParty(uniquePid()))

            // when
            val result = with(principal) {
                repo.checkEndUserMatchesAccountingPoint(uniquePid(), uniqueGsrn())
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("end user does not match accounting point / controllable unit")
        }
    }
})

private val pidCounter = AtomicLong(10_000_000_000L)

@Suppress("MagicNumber")
private fun uniquePid(): String = pidCounter.getAndIncrement().toString()

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
