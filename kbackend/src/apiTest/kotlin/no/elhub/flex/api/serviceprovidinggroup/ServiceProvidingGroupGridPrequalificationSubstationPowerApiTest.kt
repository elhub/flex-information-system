package no.elhub.flex.api.serviceprovidinggroup

import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.double
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.ApiSpec
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.util.UUID

private const val PATH = "/service_providing_group_grid_prequalification_substation_power"

private data class Setup(
    val fiso: SeededActor,
    val cso: SeededActor,
    val pso: SeededActor,
    val otherSo: SeededActor,
    val csoGp: Long,
    val psoGp: Long,
)

class ServiceProvidingGroupGridPrequalificationSubstationPowerApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.product_type",
                "flex.party",
                "flex.entity",
            )
        }

        /**
         * One SPG with a CU of 2 at one substation owned by the CSO and a CU of 3 at the same substation owned by
         * the PSO. Both have an approved grid prequalification. The PSO has a product application on the SPG.
         */
        fun seedSetup(): Setup = seed(Triggers.OFF) {
            val fiso = insertActor(TestPartyRole.FISO)
            val cso = insertActor(TestPartyRole.SO, "CSO")
            val pso = insertActor(TestPartyRole.SO, "PSO")
            val otherSo = insertActor(TestPartyRole.SO, "Other SO")
            val spg = insertServiceProvidingGroup()
            val substation = UUID.randomUUID()
            insertMembership(insertControllableUnit(apAt(cso, substation), maximumActivePower = 2.0), spg)
            insertMembership(insertControllableUnit(apAt(pso, substation), maximumActivePower = 3.0), spg)
            insertServiceProvidingGroupProductApplication(spg, pso.partyId!!, listOf(insertProductType()))
            val csoGp = insertGridPrequalification(spg, cso.partyId!!)
            val psoGp = insertGridPrequalification(spg, pso.partyId!!)
            approveGridPrequalification(csoGp)
            approveGridPrequalification(psoGp)
            Setup(fiso, cso, pso, otherSo, csoGp, psoGp)
        }

        suspend fun read(actor: SeededActor, gpId: Long): List<Triple<Int, Double, Double>> {
            val response = api.get(PATH, actor.token(), "service_providing_group_grid_prequalification_id" to "eq.$gpId")
            response.status shouldBe HttpStatusCode.OK
            return (Json.parseToJsonElement(response.text) as JsonArray).map {
                val row = it.jsonObject
                Triple(
                    row.getValue("controllable_unit_count").jsonPrimitive.int,
                    row.getValue("maximum_active_power").jsonPrimitive.double,
                    row.getValue("total_approved_maximum_active_power").jsonPrimitive.double,
                )
            }
        }

        // RLS: SPGGPPPS-FISO001
        test("a FISO sees the CUs of the impacted SO, with the approved total of the substation") {
            val s = seedSetup()
            // the approved total counts the CUs of both SOs, each once
            read(s.fiso, s.csoGp) shouldBe listOf(Triple(1, 2.0, 5.0))
        }

        // RLS: SPGGPPPS-SO001
        test("the CSO sees its own CUs, and a total that only covers what it can read") {
            val s = seedSetup()
            read(s.cso, s.csoGp) shouldBe listOf(Triple(1, 2.0, 2.0))
        }

        test("an SO that is not impacted sees nothing") {
            val s = seedSetup()
            read(s.otherSo, s.csoGp) shouldBe emptyList()
        }

        // RLS: SPGGPPPS-SO002
        test("the PSO sees all CUs of the group on its own grid prequalification") {
            val s = seedSetup()
            read(s.pso, s.psoGp) shouldBe listOf(Triple(2, 5.0, 5.0))
        }

        test("the PSO sees all CUs of the group on the grid prequalification of another SO") {
            val s = seedSetup()
            read(s.pso, s.csoGp) shouldBe listOf(Triple(2, 5.0, 5.0))
        }
    })

private fun SeedScope.apAt(owner: SeededActor, substationId: UUID): Long {
    val ap = insertAccountingPoint()
    insertGridLocation(ap, name = "Substation", businessId = substationId)
    val mga = insertMeteringGridArea()
    insertAccountingPointMeteringGridArea(ap, mga)
    insertMeteringGridAreaSystemOperator(mga, owner.partyId!!)
    return ap
}
