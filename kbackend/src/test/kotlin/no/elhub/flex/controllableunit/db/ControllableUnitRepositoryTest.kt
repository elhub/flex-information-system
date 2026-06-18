package no.elhub.flex.controllableunit.db

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.maps.shouldBeEmpty
import io.kotest.matchers.maps.shouldHaveSize
import io.kotest.matchers.shouldBe
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.todayIn
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.AccountingPointId
import no.elhub.flex.model.domain.ControllableUnit
import no.elhub.flex.model.domain.ControllableUnitStatus
import no.elhub.flex.model.domain.RegulationDirection
import no.elhub.flex.util.uniqueGsrn
import java.math.BigDecimal
import java.sql.Connection
import java.util.UUID
import kotlin.time.Clock

@Suppress("MagicNumber")
class ControllableUnitRepositoryTest : FunSpec({

    val repo = ControllableUnitRepositoryImpl()

    val principal = FlexPrincipal(role = "flex_flexibility_information_system_operator", eid = "0")

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.accounting_point CASCADE")
            }
        }
    }

    context("lookupControllableUnits") {

        test("returns expected CUs when queried by CU business ID") {
            // given
            val apBusinessId = uniqueGsrn()
            val seeded = seedControllableUnits(
                apBusinessId = apBusinessId,
                cus = listOf(testControllableUnit(name = "CU Beta")),
            )
            val cuId = seeded.first().id
            insertTechnicalResource(name = "TR One", cuId = cuId)
            insertTechnicalResource(name = "TR Two", cuId = cuId)
            seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(testControllableUnit(name = "Noise CU")),
            )

            // when
            val result = with(principal) {
                repo.lookupControllableUnits(
                    controllableUnitBusinessId = seeded.first().businessId,
                    accountingPointBusinessId = "",
                )
            }.shouldBeRight()

            // then
            result shouldHaveSize 1
            result.first().businessId shouldBe seeded.first().businessId
            result.first().technicalResources.map { it.name } shouldContainExactlyInAnyOrder listOf("TR One", "TR Two")
        }

        test("returns expected CUs when queried by accounting point") {
            // given
            val apBusinessId = uniqueGsrn()
            val seeded = seedControllableUnits(
                apBusinessId = apBusinessId,
                cus = listOf(
                    testControllableUnit(name = "CU One"),
                    testControllableUnit(name = "CU Two"),
                ),
            )
            seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(testControllableUnit(name = "Noise CU")),
            )

            // when
            val result = with(principal) {
                repo.lookupControllableUnits(controllableUnitBusinessId = "", accountingPointBusinessId = apBusinessId)
            }.shouldBeRight()

            // then
            result shouldHaveSize 2
            result.map { it.businessId } shouldContainExactlyInAnyOrder seeded.map { it.businessId }
        }

        test("returns empty list when CU business ID does not exist") {
            // when
            val result = with(principal) {
                repo.lookupControllableUnits(
                    controllableUnitBusinessId = uniqueUuid(),
                    accountingPointBusinessId = "",
                )
            }.shouldBeRight()

            // then
            result shouldHaveSize 0
        }
    }

    context("getByAccountingPointId") {

        test("returns all CUs for the given accounting point") {
            // given
            val apBusinessId = uniqueGsrn()
            val seeded = seedControllableUnits(
                apBusinessId = apBusinessId,
                cus = listOf(
                    testControllableUnit(name = "CU One"),
                    testControllableUnit(name = "CU Two"),
                ),
            )
            val apId = seeded.first().accountingPointId

            // when
            val result = with(principal) { repo.getByAccountingPointId(apId) }.shouldBeRight()

            // then
            result shouldContainExactlyInAnyOrder seeded
        }

        test("returns empty list when no CUs exist for the given accounting point") {
            // given — AP with no CUs
            val apId = insertAccountingPoint(uniqueGsrn())

            // when
            val result = with(principal) { repo.getByAccountingPointId(apId) }.shouldBeRight()

            // then
            result shouldHaveSize 0
        }

        test("does not return CUs belonging to a different accounting point") {
            // given
            val targetSeeded = seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(testControllableUnit(name = "Target CU")),
            )
            seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(testControllableUnit(name = "Noise CU")),
            )
            val targetApId = targetSeeded.first().accountingPointId

            // when
            val result = with(principal) { repo.getByAccountingPointId(targetApId) }.shouldBeRight()

            // then
            result shouldContainExactlyInAnyOrder targetSeeded
        }
    }

    context("getEarliestStartDateByAccountingPointIds") {

        test("returns the earliest start date per accounting point") {
            // given — two APs, each with two CUs with different start dates
            val earlierDate = LocalDate(2024, 1, 1)
            val laterDate = LocalDate(2025, 6, 1)
            val seeded1 = seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(
                    testControllableUnit(name = "CU A", startDate = earlierDate),
                    testControllableUnit(name = "CU B", startDate = laterDate),
                ),
            )
            val seeded2 = seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(
                    testControllableUnit(name = "CU C", startDate = laterDate),
                    testControllableUnit(name = "CU D", startDate = earlierDate),
                ),
            )
            val apId1 = seeded1.first().accountingPointId
            val apId2 = seeded2.first().accountingPointId

            // when
            val result = with(principal) {
                repo.getEarliestStartDateByAccountingPointIds(listOf(apId1, apId2))
            }.shouldBeRight()

            // then
            result shouldHaveSize 2
            result[AccountingPointId(apId1)] shouldBe earlierDate
            result[AccountingPointId(apId2)] shouldBe earlierDate
        }

        test("does not include APs not in the input list") {
            // given — two APs seeded, only one queried
            val seeded1 = seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(testControllableUnit(name = "CU One")),
            )
            seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(testControllableUnit(name = "Noise CU")),
            )
            val apId1 = seeded1.first().accountingPointId

            // when
            val result = with(principal) {
                repo.getEarliestStartDateByAccountingPointIds(listOf(apId1))
            }.shouldBeRight()

            // then
            result shouldHaveSize 1
            result.keys shouldContainExactlyInAnyOrder listOf(AccountingPointId(apId1))
        }

        test("omits APs where all start_dates are NULL") {
            // given
            val seeded = seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(testControllableUnit(name = "CU No Date", startDate = null)),
            )
            val apId = seeded.first().accountingPointId

            // when
            val result = with(principal) {
                repo.getEarliestStartDateByAccountingPointIds(listOf(apId))
            }.shouldBeRight()

            // then
            result.shouldBeEmpty()
        }

        test("returns empty map for empty input") {
            // when
            val result = with(principal) {
                repo.getEarliestStartDateByAccountingPointIds(emptyList())
            }.shouldBeRight()

            // then
            result.shouldBeEmpty()
        }
    }
})

private fun uniqueUuid(): String = UUID.randomUUID().toString()

private fun testControllableUnit(
    businessId: String = uniqueUuid(),
    name: String = "CU $businessId",
    startDate: LocalDate? = Clock.System.todayIn(TimeZone.of("Europe/Oslo")),
    accountingPointId: Long = 0L,
): ControllableUnit = ControllableUnit(
    id = 0,
    businessId = businessId,
    name = name,
    startDate = startDate,
    status = ControllableUnitStatus.NEW,
    regulationDirection = RegulationDirection.UP,
    maximumActivePower = BigDecimal("100.000"),
    isSmall = false,
    additionalInformation = null,
    accountingPointId = accountingPointId,
    createdByPartyId = 0L,
)

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

private fun seedControllableUnits(
    apBusinessId: String,
    cus: List<ControllableUnit>,
): List<ControllableUnit> =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }

        conn.prepareStatement("INSERT INTO flex.accounting_point (business_id) VALUES (?) ON CONFLICT DO NOTHING")
            .use { stmt ->
                stmt.setString(1, apBusinessId)
                stmt.execute()
            }

        val apId = conn.prepareStatement("SELECT id FROM flex.accounting_point WHERE business_id = ?")
            .use { stmt ->
                stmt.setString(1, apBusinessId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }

        val result = cus.map { cu ->
            val cuId = insertControllableUnit(conn, cu, apId)
            cu.copy(id = cuId, accountingPointId = apId)
        }

        conn.commit()
        result
    }

private fun insertControllableUnit(conn: Connection, cu: ControllableUnit, apId: Long): Long =
    conn.prepareStatement(
        """
        INSERT INTO flex.controllable_unit (business_id, name, start_date, regulation_direction, maximum_active_power, accounting_point_id)
        VALUES (?::uuid, ?, ?::date, ?, ?, ?)
        RETURNING id
        """.trimIndent(),
    ).use { stmt ->
        stmt.setString(1, cu.businessId)
        stmt.setString(2, cu.name)
        stmt.setObject(3, cu.startDate?.toString(), java.sql.Types.DATE)
        stmt.setString(4, cu.regulationDirection.direction)
        stmt.setBigDecimal(5, cu.maximumActivePower)
        stmt.setLong(6, apId)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }

private fun insertTechnicalResource(name: String, cuId: Long) =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        conn.prepareStatement(
            """
            INSERT INTO flex.technical_resource (name, controllable_unit_id, technology, maximum_active_power, device_type)
            VALUES (?, ?, '{other.consumption}', 0.001, 'other')
            """.trimIndent(),
        ).use { stmt ->
            stmt.setString(1, name)
            stmt.setLong(2, cuId)
            stmt.executeUpdate()
        }
        conn.commit()
    }
