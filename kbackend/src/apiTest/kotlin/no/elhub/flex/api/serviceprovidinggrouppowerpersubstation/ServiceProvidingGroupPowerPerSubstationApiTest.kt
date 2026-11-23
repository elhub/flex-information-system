package no.elhub.flex.api.serviceprovidinggrouppowerpersubstation

import io.kotest.matchers.comparables.shouldBeEqualComparingTo
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupPowerPerSubstationResponse
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.math.BigDecimal
import java.util.UUID

private fun decimal(value: Double) = BigDecimal.valueOf(value)

/**
 * Seeds a controllable unit with the maximum active power [power] and one technical resource with [resourcePower], at
 * a new accounting point owned by [owner] (a new system operator by default). The accounting point has a grid location
 * in the [substation], when there is one, which has the name [substationName].
 */
private fun SeedScope.insertUnit(
    power: Double,
    resourcePower: Double,
    substation: UUID? = null,
    substationName: String? = null,
    owner: Long = insertParty(TestPartyRole.SO, "CSO ${UUID.randomUUID()}"),
): Long {
    val accountingPoint = insertAccountingPointOwnedBy(owner)
    substation?.let { insertGridLocation(accountingPoint, substationName!!, it) }
    return insertControllableUnit(accountingPoint, maximumActivePower = power).also { insertTechnicalResource(it, maximumActivePower = resourcePower) }
}

/** The memberships are seeded with Triggers.OFF, as the triggers would check the status and the contract of the units. */
private fun SeedScope.addToGroup(group: Long, units: List<Long>) = units.forEach { insertMembership(it, group) }

class ServiceProvidingGroupPowerPerSubstationApiTest :
    ApiSpec({
        beforeEach {
            truncate("flex.service_providing_group", "flex.accounting_point", "flex.substation_cluster", "flex.party", "flex.entity")
        }

        // RLS: SPGPPS-FISO001
        context("a FISO") {
            test("sees no substations for a group without members") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }

                val response = api.get("/service_providing_group_power_per_substation/$group", fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<ServiceProvidingGroupPowerPerSubstationResponse>().substations shouldBe emptyList()
            }

            // Substation A (Bor): units with the maximum active power 8, 16 and 24, and one technical resource each with 10, 20 and 30
            // Substation B (Sol): one unit with the maximum active power 32, and a technical resource with 40
            // No substation: one unit with the maximum active power 40, and a technical resource with 50
            // A unit with a technical resource of 1000 at substation A has left the group, and is not counted
            test("sees the power of the current members per substation, and of the members without a substation together") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }
                val substationA = seed { insertSubstation() }
                val substationB = seed { insertSubstation() }
                val members = seed {
                    listOf(
                        insertUnit(8.0, 10.0, substationA, "Bor 132 kV"),
                        insertUnit(16.0, 20.0, substationA, "Bor 132 kV"),
                        insertUnit(24.0, 30.0, substationA, "Bor 132 kV"),
                        insertUnit(32.0, 40.0, substationB, "Sol transformatorstasjon"),
                        insertUnit(40.0, 50.0),
                    )
                }
                val former = seed { insertUnit(500.0, 1000.0, substationA, "Bor 132 kV") }
                seed(Triggers.OFF) {
                    addToGroup(group, members)
                    insertMembership(former, group, validTo = osloMidnight("2024-02-01"))
                }

                val response = api.get("/service_providing_group_power_per_substation/$group", fiso.token())

                response.status shouldBe HttpStatusCode.OK
                val substations = response.body<ServiceProvidingGroupPowerPerSubstationResponse>().substations!!
                substations.size shouldBe 3
                val a = substations.single { it.substationBusinessId == substationA.toString() }
                a.substationName shouldBe "Bor 132 kV"
                a.controllableUnit!!.count shouldBe 3
                a.controllableUnit!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(48.0)
                a.controllableUnit!!.maximumActivePower!!.average!! shouldBeEqualComparingTo decimal(16.0)
                a.controllableUnit!!.maximumActivePower!!.min!! shouldBeEqualComparingTo decimal(8.0)
                a.controllableUnit!!.maximumActivePower!!.max!! shouldBeEqualComparingTo decimal(24.0)
                a.technicalResource!!.count shouldBe 3
                a.technicalResource!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(60.0)
                a.technicalResource!!.maximumActivePower!!.average!! shouldBeEqualComparingTo decimal(20.0)
                a.technicalResource!!.maximumActivePower!!.min!! shouldBeEqualComparingTo decimal(10.0)
                a.technicalResource!!.maximumActivePower!!.max!! shouldBeEqualComparingTo decimal(30.0)
                val b = substations.single { it.substationBusinessId == substationB.toString() }
                b.substationName shouldBe "Sol transformatorstasjon"
                b.controllableUnit!!.count shouldBe 1
                b.controllableUnit!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(32.0)
                b.technicalResource!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(40.0)
                val withoutSubstation = substations.single { it.substationBusinessId == null }
                withoutSubstation.substationName shouldBe null
                withoutSubstation.controllableUnit!!.count shouldBe 1
                withoutSubstation.controllableUnit!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(40.0)
                withoutSubstation.technicalResource!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(50.0)
            }
        }

        // RLS: SPGPPS-SO001
        // The system operator sees the power of a group that it sees, but only of the units that it sees, which are the units in its area.
        context("a system operator") {
            test("sees the power per substation of a group it has a grid prequalification for, of the units in its area") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)).also { insertGridPrequalification(it, so.partyId!!) } }
                val ownUnit = seed { insertUnit(5.0, 10.0, owner = so.partyId!!) }
                val otherUnit = seed { insertUnit(7.0, 20.0) }
                seed(Triggers.OFF) { addToGroup(group, listOf(ownUnit, otherUnit)) }

                val response = api.get("/service_providing_group_power_per_substation/$group", so.token())

                response.status shouldBe HttpStatusCode.OK
                val substation = response.body<ServiceProvidingGroupPowerPerSubstationResponse>().substations!!.single()
                substation.controllableUnit!!.count shouldBe 1
                substation.controllableUnit!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(5.0)
                substation.technicalResource!!.count shouldBe 1
                substation.technicalResource!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(10.0)
            }

            test("does not see the power per substation of a group it does not see") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }
                // the system operator sees another group, which makes sure that it is not enough to see some group
                seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")).also { insertGridPrequalification(it, so.partyId!!) } }

                api.get("/service_providing_group_power_per_substation/$group", so.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // The view is only for the FISO and the system operator, and the API denies the other roles, also the service provider of the group.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO)) {
            test("${role.type} cannot read the power per substation of a group") {
                val actor = seed { insertActor(role) }
                val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }

                api.get("/service_providing_group_power_per_substation/$group", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot read the power per substation of a group") {
            val org = seed { insertActor(TestPartyRole.ORG) }
            val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }

            api.get("/service_providing_group_power_per_substation/$group", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
