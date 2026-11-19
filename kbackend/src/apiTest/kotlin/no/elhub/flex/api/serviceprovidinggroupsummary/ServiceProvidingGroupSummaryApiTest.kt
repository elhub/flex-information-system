package no.elhub.flex.api.serviceprovidinggroupsummary

import io.kotest.matchers.comparables.shouldBeEqualComparingTo
import io.kotest.matchers.doubles.plusOrMinus
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitRegulationDirection
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupSummaryResponse
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.math.BigDecimal

private fun decimal(value: Double) = BigDecimal.valueOf(value)

class ServiceProvidingGroupSummaryApiTest :
    ApiSpec({
        beforeEach {
            truncate("flex.service_providing_group", "flex.accounting_point", "flex.party", "flex.entity")
        }

        // RLS: SPGSU-COM001
        // The summary of a group is visible to the roles that can see the group.
        context("the summary of a group") {
            test("is visible to a FISO") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }

                api.get("/service_providing_group_summary/$group", fiso.token()).status shouldBe HttpStatusCode.OK
            }

            test("is visible to the service provider of the group, and not to another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val own = seed { insertServiceProvidingGroup(sp.partyId!!) }
                val other = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")) }

                api.get("/service_providing_group_summary/$own", sp.token()).status shouldBe HttpStatusCode.OK
                api.get("/service_providing_group_summary/$other", sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("is visible to a system operator that has a grid prequalification for the group, and not to another") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val prequalified = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)).also { insertGridPrequalification(it, so.partyId!!) } }
                val other = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")) }

                api.get("/service_providing_group_summary/$prequalified", so.token()).status shouldBe HttpStatusCode.OK
                api.get("/service_providing_group_summary/$other", so.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // The other roles have a grant on the summary but not on the groups, which the summary is read through.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("the summary of a group is denied to ${role.type}") {
                val actor = seed { insertActor(role) }
                val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }

                api.get("/service_providing_group_summary/$group", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("the summary of a group is denied to an organisation") {
            val org = seed { insertActor(TestPartyRole.ORG) }
            val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }

            api.get("/service_providing_group_summary/$group", org.token()).status shouldBe HttpStatusCode.Forbidden
        }

        test("a group without members has a summary with zeros") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }

            val summary = api.get("/service_providing_group_summary/$group", fiso.token()).body<ServiceProvidingGroupSummaryResponse>()

            summary.controllableUnit!!.count shouldBe 0
            summary.controllableUnit!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(0.0)
            summary.controllableUnit!!.maximumActivePowerUp!!.sum!! shouldBeEqualComparingTo decimal(0.0)
            summary.controllableUnit!!.maximumActivePowerDown!!.sum!! shouldBeEqualComparingTo decimal(0.0)
            summary.technicalResource!!.count shouldBe 0
            summary.technicalResource!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(0.0)
            summary.technicalResource!!.byTechnology shouldBe emptyMap()
            summary.technicalResource!!.byCategory shouldBe emptyMap()
        }

        // The members are the units with a membership that is current now, so a unit that left the group does not count.
        //   Unit A: maximum active power 30, regulates up
        //     TR1 is solar (production) with 10
        //     TR2 is solar (production) with 20
        //   Unit B: maximum active power 50, regulates down
        //     TR3 is battery (energy storage) with 30
        //     TR4 is hvac (consumption) with 15
        //     TR5 is solar and battery (production and energy storage) with 25
        //   Unit C: maximum active power 20, regulates both
        //     no technical resources
        //   Unit D left the group, and its technical resource with 1000 is not counted
        test("the summary aggregates the units and the technical resources of the current members") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }
            val (a, b, c, d) = seed {
                fun unit(power: Double, direction: ControllableUnitRegulationDirection) =
                    insertControllableUnit(insertAccountingPoint(), maximumActivePower = power, regulationDirection = direction)
                val units = listOf(
                    unit(30.0, ControllableUnitRegulationDirection.UP),
                    unit(50.0, ControllableUnitRegulationDirection.DOWN),
                    unit(20.0, ControllableUnitRegulationDirection.BOTH),
                    unit(5.0, ControllableUnitRegulationDirection.BOTH),
                )
                insertTechnicalResource(units[0], "TR1", listOf("solar"), 10.0)
                insertTechnicalResource(units[0], "TR2", listOf("solar"), 20.0)
                insertTechnicalResource(units[1], "TR3", listOf("battery"), 30.0)
                insertTechnicalResource(units[1], "TR4", listOf("hvac"), 15.0)
                insertTechnicalResource(units[1], "TR5", listOf("solar", "battery"), 25.0)
                insertTechnicalResource(units[3], "TR6", listOf("solar"), 1000.0)
                units
            }
            // the memberships are seeded with Triggers.OFF, as the triggers would check the status and the contract of the units
            seed(Triggers.OFF) {
                listOf(a, b, c).forEach { insertMembership(it, group) }
                insertMembership(d, group, validFrom = osloMidnight("2024-01-01"), validTo = osloMidnight("2024-02-01"))
            }

            val summary = api.get("/service_providing_group_summary/$group", fiso.token()).body<ServiceProvidingGroupSummaryResponse>()

            val units = summary.controllableUnit!!
            units.count shouldBe 3
            units.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(100.0)
            units.maximumActivePower!!.average!!.toDouble() shouldBe (100.0 / 3 plusOrMinus 0.0001)
            units.maximumActivePower!!.min!! shouldBeEqualComparingTo decimal(20.0)
            units.maximumActivePower!!.max!! shouldBeEqualComparingTo decimal(50.0)
            units.maximumActivePowerUp!!.sum!! shouldBeEqualComparingTo decimal(50.0)
            units.maximumActivePowerUp!!.average!! shouldBeEqualComparingTo decimal(25.0)
            units.maximumActivePowerDown!!.sum!! shouldBeEqualComparingTo decimal(70.0)
            units.maximumActivePowerDown!!.average!! shouldBeEqualComparingTo decimal(35.0)

            val resources = summary.technicalResource!!
            resources.count shouldBe 5
            resources.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(100.0)
            resources.maximumActivePower!!.average!! shouldBeEqualComparingTo decimal(20.0)
            resources.byTechnology!!["solar"]!!.count shouldBe 3
            resources.byTechnology!!["battery"]!!.count shouldBe 2
            resources.byTechnology!!["hvac"]!!.count shouldBe 1
            resources.byTechnology!!["solar"]!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(55.0)
            resources.byTechnology!!["solar"]!!.maximumActivePower!!.average!!.toDouble() shouldBe (55.0 / 3 plusOrMinus 0.0001)
            resources.byCategory!!["production"]!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(55.0)
            resources.byCategory!!["consumption"]!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(15.0)
            resources.byCategory!!["energy_storage"]!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(55.0)
        }
    })
