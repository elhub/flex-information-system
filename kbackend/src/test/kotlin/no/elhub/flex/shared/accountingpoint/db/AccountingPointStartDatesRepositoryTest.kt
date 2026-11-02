package no.elhub.flex.shared.accountingpoint.db

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.shared.accountingpoint.model.AccountingPointId
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.testutil.uniqueGsrn
import java.util.UUID
import kotlin.time.Instant

@Suppress("MagicNumber")
class AccountingPointStartDatesRepositoryTest : FunSpec({

    val repo = AccountingPointStartDatesRepositoryImpl()

    val internalDataPrincipal = FlexPrincipal.internalData

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.accounting_point CASCADE")
            }
        }
    }

    context("getAccountingPointStartDates") {

        test("returns the earliest CU start_date per accounting point") {
            // given - two APs, each with two CUs with different start dates
            val apId1 = insertAccountingPoint(uniqueGsrn())
            val apId2 = insertAccountingPoint(uniqueGsrn())
            val earlierDate = "2024-01-01"
            val laterDate = "2025-06-01"
            insertControllableUnitWithStartDate(apId1, UUID.randomUUID().toString(), earlierDate)
            insertControllableUnitWithStartDate(apId1, UUID.randomUUID().toString(), laterDate)
            insertControllableUnitWithStartDate(apId2, UUID.randomUUID().toString(), laterDate)
            insertControllableUnitWithStartDate(apId2, UUID.randomUUID().toString(), earlierDate)

            // when
            val result = with(internalDataPrincipal) {
                repo.getAccountingPointStartDates(listOf(apId1, apId2))
            }.shouldBeRight()

            // then - each AP's controllableUnitStartTime reflects the earliest CU start_date
            result.size shouldBe 2
            val start1 = result[AccountingPointId(apId1)]
            val start2 = result[AccountingPointId(apId2)]
            start1?.controllableUnitStartTime shouldBe Instant.parse("2023-12-31T23:00:00Z")
            start2?.controllableUnitStartTime shouldBe Instant.parse("2023-12-31T23:00:00Z")
        }

        test("does not include APs not in the input list") {
            // given - two APs seeded, only one queried
            val apId1 = insertAccountingPoint(uniqueGsrn())
            insertAccountingPoint(uniqueGsrn()) // noise
            insertControllableUnitWithStartDate(apId1, UUID.randomUUID().toString(), "2024-01-01")

            // when
            val result = with(internalDataPrincipal) {
                repo.getAccountingPointStartDates(listOf(apId1))
            }.shouldBeRight()

            // then
            result.size shouldBe 1
            result.keys shouldContainExactlyInAnyOrder listOf(AccountingPointId(apId1))
        }

        test("returns empty map for empty input") {
            // when
            val result = with(internalDataPrincipal) {
                repo.getAccountingPointStartDates(emptyList())
            }.shouldBeRight()

            // then
            result.size shouldBe 0
        }
    }
})

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

/** Inserts a controllable unit with a specific start_date (ISO date string, e.g. "2024-01-01"). */
private fun insertControllableUnitWithStartDate(apId: Long, cuBusinessId: String, startDate: String): Long =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        val id = conn.prepareStatement(
            """
            INSERT INTO flex.controllable_unit (business_id, name, start_date, regulation_direction, maximum_active_power, accounting_point_id)
            VALUES (?::uuid, ?, ?::date, 'up', 100.0, ?)
            RETURNING id
            """.trimIndent(),
        ).use { stmt ->
            stmt.setString(1, cuBusinessId)
            stmt.setString(2, "CU $cuBusinessId")
            stmt.setString(3, startDate)
            stmt.setLong(4, apId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }
        conn.commit()
        id
    }
