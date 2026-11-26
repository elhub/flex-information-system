package no.elhub.flex.api.serviceprovidinggroup.db

import arrow.core.Either
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededSystemOperator
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import java.util.UUID

/**
 * `flex.service_providing_group_grid_prequalification_substation_power`: the power of a grid prequalification
 * per substation, with the total approved power of the substation for the impacted SO.
 *
 * The total only counts controllable units (CUs) that were members of the SPG, as known to the system, when
 * the grid prequalification was approved (`prequalified_at`). A CU added later is not counted until the
 * changes are approved, even if its membership is valid from before the approval.
 *
 * Triggers are off while seeding, so the rows only need to exist. Rows that must be recorded before or after the
 * approval are seeded in separate blocks (transactions), as the record time is the start of the transaction.
 */
class ServiceProvidingGroupGridPrequalificationSubstationPowerTest : FunSpec({

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute(
                    "TRUNCATE flex.accounting_point, flex.party, flex.entity, " +
                        "flex.metering_grid_area, flex.product_type CASCADE",
                )
            }
        }
    }

    context("total approved power") {

        test("is zero when nothing is approved, and the own power is shown") {
            // given
            val setup = seedGroup(powers = listOf(2.0, 3.0))

            // when
            val rows = with(setup.cso.principal) { readRows(setup.gridPrequalificationId) }

            // then
            rows shouldBe listOf(Row("Substation", 2, 5.0, 0.0))
        }

        test("counts the CUs of an approved grid prequalification") {
            // given
            val setup = seedGroup(powers = listOf(2.0, 3.0))
            seed(Triggers.OFF) { approveGridPrequalification(setup.gridPrequalificationId) }

            // when
            val rows = with(setup.cso.principal) { readRows(setup.gridPrequalificationId) }

            // then
            rows shouldBe listOf(Row("Substation", 2, 5.0, 5.0))
        }

        test("does not count a CU added after the approval, even if its membership is valid from before") {
            // given
            val setup = seedGroup(powers = listOf(2.0, 3.0))
            seed(Triggers.OFF) { approveGridPrequalification(setup.gridPrequalificationId) }
            seed(Triggers.OFF) {
                // valid from 2024-01-01, which is before the approval
                val ap = insertAccountingPointInSubstation(setup.cso, setup.substationId)
                insertMembership(insertControllableUnit(ap, maximumActivePower = 5.0), setup.spgId)
            }

            // when
            val rows = with(setup.cso.principal) { readRows(setup.gridPrequalificationId) }

            // then the own power includes the new CU, the approved total does not
            rows shouldBe listOf(Row("Substation", 3, 10.0, 5.0))
        }

        test("counts a CU added after the approval once the changes are approved") {
            // given
            val setup = seedGroup(powers = listOf(2.0, 3.0))
            seed(Triggers.OFF) { approveGridPrequalification(setup.gridPrequalificationId) }
            seed(Triggers.OFF) {
                val ap = insertAccountingPointInSubstation(setup.cso, setup.substationId)
                insertMembership(insertControllableUnit(ap, maximumActivePower = 5.0), setup.spgId)
            }
            seed(Triggers.OFF) { approveGridPrequalification(setup.gridPrequalificationId) }

            // when
            val rows = with(setup.cso.principal) { readRows(setup.gridPrequalificationId) }

            // then
            rows shouldBe listOf(Row("Substation", 3, 10.0, 10.0))
        }

        test("counts a CU once when it is in several approved SPGs, and shows the total in both") {
            // given
            val setup = seedGroup(powers = listOf(2.0, 3.0))
            val other = seed(Triggers.OFF) {
                val otherSpgId = insertServiceProvidingGroup()
                val otherGp = insertGridPrequalification(otherSpgId, setup.cso.partyId)
                // CU2 is in both SPGs, and CU4 only in the other
                insertMembership(setup.cuIds[1], otherSpgId)
                val ap = insertAccountingPointInSubstation(setup.cso, setup.substationId)
                insertMembership(insertControllableUnit(ap, maximumActivePower = 7.0), otherSpgId)
                otherGp
            }
            seed(Triggers.OFF) {
                approveGridPrequalification(setup.gridPrequalificationId)
                approveGridPrequalification(other)
            }

            // when
            val rows = with(setup.cso.principal) { readRows(setup.gridPrequalificationId) }
            val otherRows = with(setup.cso.principal) { readRows(other) }

            // then 2 + 3 + 7, with the shared CU of 3 counted once
            rows shouldBe listOf(Row("Substation", 2, 5.0, 12.0))
            otherRows shouldBe listOf(Row("Substation", 2, 10.0, 12.0))
        }

        test("does not count a grid prequalification that is not approved") {
            // given
            val setup = seedGroup(powers = listOf(2.0, 3.0))
            val other = seed(Triggers.OFF) {
                val otherSpgId = insertServiceProvidingGroup()
                val otherGp = insertGridPrequalification(otherSpgId, setup.cso.partyId)
                val ap = insertAccountingPointInSubstation(setup.cso, setup.substationId)
                insertMembership(insertControllableUnit(ap, maximumActivePower = 7.0), otherSpgId)
                otherGp
            }
            seed(Triggers.OFF) { approveGridPrequalification(setup.gridPrequalificationId) }

            // when
            val otherRows = with(setup.cso.principal) { readRows(other) }

            // then only the approved SPG counts
            otherRows shouldBe listOf(Row("Substation", 1, 7.0, 5.0))
        }

        test("does not include CUs without a substation") {
            // given
            val setup = seedGroup(powers = listOf(2.0))
            seed(Triggers.OFF) {
                val apWithoutSubstation = insertAccountingPoint()
                val mgaId = insertMeteringGridArea()
                insertAccountingPointMeteringGridArea(apWithoutSubstation, mgaId)
                insertMeteringGridAreaSystemOperator(mgaId, setup.cso.partyId)
                insertMembership(insertControllableUnit(apWithoutSubstation, maximumActivePower = 9.0), setup.spgId)
            }
            seed(Triggers.OFF) { approveGridPrequalification(setup.gridPrequalificationId) }

            // when
            val rows = with(setup.cso.principal) { readRows(setup.gridPrequalificationId) }

            // then
            rows shouldBe listOf(Row("Substation", 1, 2.0, 2.0))
        }
    }

    context("SPGGPPPS-SO001") {

        test("an SO that is not impacted gets no rows") {
            // given
            val setup = seedGroup(powers = listOf(2.0))
            seed(Triggers.OFF) { approveGridPrequalification(setup.gridPrequalificationId) }
            val other = seed(Triggers.OFF) { insertSystemOperator("Other SO") }

            // when
            val rows = with(other.principal) { readRows(setup.gridPrequalificationId) }

            // then
            rows.shouldBeEmpty()
        }
    }
})

private data class Row(
    val substationName: String,
    val controllableUnitCount: Int,
    val maximumActivePower: Double,
    val totalApprovedMaximumActivePower: Double,
)

private data class Setup(
    val cso: SeededSystemOperator,
    val spgId: Long,
    val gridPrequalificationId: Long,
    val substationId: UUID,
    val cuIds: List<Long>,
)

/**
 * A SPG with one CU per given power, all at the same substation. The CSO is the impacted SO of the (requested)
 * grid prequalification of the SPG.
 */
private fun seedGroup(powers: List<Double>): Setup =
    seed(Triggers.OFF) {
        val cso = insertSystemOperator("CSO")
        val spgId = insertServiceProvidingGroup()
        val gp = insertGridPrequalification(spgId, cso.partyId)
        val substationId = UUID.randomUUID()
        val cuIds = powers.map { power ->
            val ap = insertAccountingPointInSubstation(cso, substationId)
            insertControllableUnit(ap, maximumActivePower = power).also { insertMembership(it, spgId) }
        }
        Setup(cso, spgId, gp, substationId, cuIds)
    }

/** Adds a new accounting point located in the substation, with [owner] as its CSO, and returns its id. */
private fun SeedScope.insertAccountingPointInSubstation(owner: SeededSystemOperator, substationId: UUID): Long {
    val apId = insertAccountingPoint()
    insertGridLocation(apId, name = "Substation", businessId = substationId)

    val mgaId = insertMeteringGridArea()
    insertAccountingPointMeteringGridArea(apId, mgaId)
    insertMeteringGridAreaSystemOperator(mgaId, owner.partyId)

    return apId
}

context(principal: FlexPrincipal)
private suspend fun readRows(gridPrequalificationId: Long): List<Row> =
    flexTransaction { conn ->
        Either.Right(
            conn.prepareStatement(
                """
                SELECT
                    substation_name,
                    controllable_unit_count,
                    maximum_active_power,
                    total_approved_maximum_active_power
                FROM flex.service_providing_group_grid_prequalification_substation_power
                WHERE service_providing_group_grid_prequalification_id = ?
                ORDER BY substation_name
                """.trimIndent(),
            ).use { stmt ->
                stmt.setLong(1, gridPrequalificationId)
                stmt.executeQuery().use { rs ->
                    buildList {
                        while (rs.next()) {
                            add(
                                Row(
                                    rs.getString(1),
                                    rs.getInt(2),
                                    rs.getBigDecimal(3).toDouble(),
                                    rs.getBigDecimal(4).toDouble(),
                                ),
                            )
                        }
                    }
                }
            },
        )
    }.shouldBeRight()
