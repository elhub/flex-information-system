package no.elhub.flex.api.controllableunitsummary

import io.kotest.matchers.comparables.shouldBeEqualComparingTo
import io.kotest.matchers.doubles.plusOrMinus
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSummaryResponse
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.math.BigDecimal

private fun decimal(value: Double) = BigDecimal.valueOf(value)

class ControllableUnitSummaryApiTest :
    ApiSpec({
        beforeEach { truncate("flex.accounting_point", "flex.metering_grid_area", "flex.party", "flex.entity") }

        // RLS: CUSU-COM001
        // The summary of a controllable unit is visible to the roles that can see the unit.
        context("the summary of a controllable unit") {
            test("is visible to a FISO") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val unit = seed { insertControllableUnitAtNewAccountingPoint() }

                api.get("/controllable_unit_summary/${unit.id}", fiso.token()).status shouldBe HttpStatusCode.OK
            }

            test("is visible to the CSO of the unit, and not to another system operator") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val own = seed { insertControllableUnit(insertAccountingPointOwnedBy(so.partyId!!)) }
                val other = seed { insertControllableUnit(insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO"))) }

                api.get("/controllable_unit_summary/$own", so.token()).status shouldBe HttpStatusCode.OK
                api.get("/controllable_unit_summary/$other", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("is visible to the service provider of the unit, and not to another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val own = seed { insertControllableUnitAtNewAccountingPoint() }
                val other = seed { insertControllableUnitAtNewAccountingPoint() }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, own) }

                api.get("/controllable_unit_summary/${own.id}", sp.token()).status shouldBe HttpStatusCode.OK
                api.get("/controllable_unit_summary/${other.id}", sp.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        test("a controllable unit without technical resources has a summary with zeros") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val unit = seed { insertControllableUnitAtNewAccountingPoint() }

            val summary = api.get("/controllable_unit_summary/${unit.id}", fiso.token()).body<ControllableUnitSummaryResponse>().technicalResource!!

            summary.count shouldBe 0
            summary.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(0.0)
            summary.maximumActivePower!!.average!! shouldBeEqualComparingTo decimal(0.0)
            summary.byTechnology shouldBe emptyMap()
        }

        test("the summary aggregates the technical resources by technology and category") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            // TR1 and TR2 are solar (production), TR3 is a battery (energy storage), TR4 is hvac (consumption), and TR5
            // is solar and battery (production and energy storage)
            val unit = seed {
                insertControllableUnitAtNewAccountingPoint().also {
                    insertTechnicalResource(it.id, "TR1", listOf("solar"), 10.0)
                    insertTechnicalResource(it.id, "TR2", listOf("solar"), 20.0)
                    insertTechnicalResource(it.id, "TR3", listOf("battery"), 30.0)
                    insertTechnicalResource(it.id, "TR4", listOf("hvac"), 15.0)
                    insertTechnicalResource(it.id, "TR5", listOf("solar", "battery"), 25.0)
                }
            }

            val summary = api.get("/controllable_unit_summary/${unit.id}", fiso.token()).body<ControllableUnitSummaryResponse>().technicalResource!!

            summary.count shouldBe 5
            summary.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(100.0)
            summary.maximumActivePower!!.average!! shouldBeEqualComparingTo decimal(20.0)
            summary.byTechnology!!["solar"]!!.count shouldBe 3
            summary.byTechnology!!["battery"]!!.count shouldBe 2
            summary.byTechnology!!["hvac"]!!.count shouldBe 1
            summary.byTechnology!!["solar"]!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(55.0)
            summary.byTechnology!!["solar"]!!.maximumActivePower!!.average!!.toDouble() shouldBe (55.0 / 3 plusOrMinus 0.0001)
            summary.byCategory!!["production"]!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(55.0)
            summary.byCategory!!["consumption"]!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(15.0)
            summary.byCategory!!["energy_storage"]!!.maximumActivePower!!.sum!! shouldBeEqualComparingTo decimal(55.0)
        }
    })
