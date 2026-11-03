package no.elhub.flex.api.serviceprovidinggroup.db

import arrow.core.Either
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.api.util.SeedScope
import no.elhub.flex.api.util.SeededSystemOperator
import no.elhub.flex.api.util.Triggers
import no.elhub.flex.api.util.seed
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import java.util.UUID

/**
 * `flex.service_providing_group_power_per_substation` as a system operator (SO).
 *
 * The view is security invoker, so the substations only include controllable units that the SO can see.
 * A substation without any visible controllable unit must not be returned.
 *
 * The seeding runs with triggers off, since the tests only need the rows to exist. This also means that
 * a product application does not create grid prequalifications, so the SPG is made visible to the SOs
 * through explicit grid prequalifications (SPG-SO001).
 */
class ServiceProvidingGroupPowerPerSubstationRlsTest : FunSpec({

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

    context("SPGPPS-SO001") {

        test("CSO only gets the substations of its own controllable units") {
            // given
            val (spgId, csoA) = seed(Triggers.OFF) {
                val spgId = insertServiceProvidingGroup()

                val csoA = insertSystemOperator("CSO A")
                val csoB = insertSystemOperator("CSO B")
                // makes the SPG visible to the SOs
                insertGridPrequalification(spgId, csoA.partyId)
                insertGridPrequalification(spgId, csoB.partyId)

                val apA = insertAccountingPointInSubstation(owner = csoA, substationName = "Substation A")
                val cuA = insertControllableUnit(apA)
                insertMembership(cuA, spgId)

                val apB = insertAccountingPointInSubstation(owner = csoB, substationName = "Substation B")
                val cuB = insertControllableUnit(apB)
                insertMembership(cuB, spgId)

                spgId to csoA
            }

            // when
            val substations = with(csoA.principal) { readSubstations(spgId) }

            // then
            substations shouldBe listOf(Substation("Substation A", 1))
        }

        test("each CSO gets its own substation only") {
            // given
            val (spgId, csoB) = seed(Triggers.OFF) {
                val spgId = insertServiceProvidingGroup()

                val csoA = insertSystemOperator("CSO A")
                val csoB = insertSystemOperator("CSO B")
                insertGridPrequalification(spgId, csoA.partyId)
                insertGridPrequalification(spgId, csoB.partyId)

                val apA = insertAccountingPointInSubstation(owner = csoA, substationName = "Substation A")
                val cuA = insertControllableUnit(apA)
                insertMembership(cuA, spgId)

                val apB = insertAccountingPointInSubstation(owner = csoB, substationName = "Substation B")
                val cuB = insertControllableUnit(apB)
                insertMembership(cuB, spgId)

                spgId to csoB
            }

            // when
            val substations = with(csoB.principal) { readSubstations(spgId) }

            // then
            substations shouldBe listOf(Substation("Substation B", 1))
        }

        test("SO that can see the SPG but none of its controllable units gets no substations") {
            // given
            val (spgId, iso) = seed(Triggers.OFF) {
                val spgId = insertServiceProvidingGroup()

                val cso = insertSystemOperator("CSO")
                insertGridPrequalification(spgId, cso.partyId)
                val ap = insertAccountingPointInSubstation(owner = cso, substationName = "Substation of CSO")
                val cu = insertControllableUnit(ap)
                insertMembership(cu, spgId)

                // impacted SO, not the owner of any CU in the SPG
                val iso = insertSystemOperator("ISO")
                insertGridPrequalification(spgId, iso.partyId)

                spgId to iso
            }

            // when
            val substations = with(iso.principal) { readSubstations(spgId) }

            // then
            substations.shouldBeEmpty()
        }

        test("CSO gets one substation for its controllable units that share a substation") {
            // given
            val (spgId, cso) = seed(Triggers.OFF) {
                val spgId = insertServiceProvidingGroup()

                val cso = insertSystemOperator("CSO")
                insertGridPrequalification(spgId, cso.partyId)

                val sharedSubstationId = UUID.randomUUID()
                val ap1 = insertAccountingPointInSubstation(
                    owner = cso,
                    substationName = "Shared substation",
                    substationId = sharedSubstationId,
                )
                val cu1 = insertControllableUnit(ap1)
                insertMembership(cu1, spgId)
                val ap2 = insertAccountingPointInSubstation(
                    owner = cso,
                    substationName = "Shared substation",
                    substationId = sharedSubstationId,
                )
                val cu2 = insertControllableUnit(ap2)
                insertMembership(cu2, spgId)

                spgId to cso
            }

            // when
            val substations = with(cso.principal) { readSubstations(spgId) }

            // then
            substations shouldBe listOf(Substation("Shared substation", 2))
        }
    }
})

private data class Substation(val name: String?, val controllableUnitCount: Int)

/**
 * Adds a new accounting point located in the substation, and returns its id.
 * The [owner] is the connecting SO of the accounting point, through ownership of its metering grid area.
 */
private fun SeedScope.insertAccountingPointInSubstation(
    owner: SeededSystemOperator,
    substationName: String,
    substationId: UUID = UUID.randomUUID(),
): Long {
    val apId = insertAccountingPoint()
    insertGridLocation(apId, name = substationName, businessId = substationId)

    val mgaId = insertMeteringGridArea()
    insertAccountingPointMeteringGridArea(apId, mgaId)
    insertMeteringGridAreaSystemOperator(mgaId, owner.partyId)

    return apId
}

context(principal: FlexPrincipal)
private suspend fun readSubstations(spgId: Long): List<Substation> =
    flexTransaction { conn ->
        Either.Right(
            conn.prepareStatement(
                """
                SELECT
                    s ->> 'substation_name',
                    (s -> 'controllable_unit' ->> 'count')::int
                FROM flex.service_providing_group_power_per_substation AS pps,
                    jsonb_array_elements(pps.substations) AS s
                WHERE pps.service_providing_group_id = ?
                ORDER BY 1
                """.trimIndent(),
            ).use { stmt ->
                stmt.setLong(1, spgId)
                stmt.executeQuery().use { rs ->
                    buildList {
                        while (rs.next()) {
                            add(Substation(rs.getString(1), rs.getInt(2)))
                        }
                    }
                }
            },
        )
    }.shouldBeRight()
