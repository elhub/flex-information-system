package no.elhub.flex.api.productapplication

import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.ApiResponse
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupStatus
import no.elhub.flex.apiJson
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private const val PATH = "/service_providing_group_product_application"
private const val MFRR = "manual_frequency_restoration"
private const val FCR_N = "automatic_frequency_containment"
private const val FCR_D = "automatic_frequency_containment_disturbance"

private class Setup(
    val sp: SeededActor,
    val so: SeededActor,
    val spgId: Long,
    val productTypeIds: Map<String, Long>,
) {
    /** The body of a request to create an application for [kind], with [fields] added. */
    fun create(kind: String, fields: String): String =
        """{"service_providing_group_id": $spgId, "procuring_system_operator_id": ${so.partyId},
            "product_type_ids": [${productTypeIds.getValue(kind)}], $fields}"""
}

private fun fcr(kind: String, up: Int, down: Int) =
    """{"kind": "$kind", "service_provider_contact_information": "Kari", "technical_contact_information": "Ola",
        "limited_energy_reservoir": true, "variable_production_consumption": false,
        "planned_prequalification_test_date": "2026-12-01",
        "maximum_active_power_up": $up, "maximum_active_power_down": $down}"""

private fun mfrr(power: Int) =
    """{"kind": "$MFRR", "maximum_active_power_up": $power, "maximum_active_power_down": $power,
        "ramping_capability": "partial", "ramping_description": "One by one"}"""

private fun seedSetup(): Setup =
    seed(Triggers.OFF) {
        val sp = insertActor(TestPartyRole.SP)
        val so = insertActor(TestPartyRole.SO)
        val spgId = insertServiceProvidingGroup(sp.partyId!!, status = ServiceProvidingGroupStatus.ACTIVE)
        val productTypeIds = listOf(MFRR, FCR_N, FCR_D).associateWith { insertProductType(it, businessId = it) }
        productTypeIds.values.forEach { insertSystemOperatorProductType(so.partyId!!, it) }
        insertServiceProviderProductApplication(sp.partyId!!, so.partyId!!, productTypeIds.values.toList())
        Setup(sp, so, spgId, productTypeIds)
    }

private fun ApiResponse.json(): JsonObject = apiJson.parseToJsonElement(text).jsonObject

private fun ApiResponse.field(name: String) = json().getValue(name)

class ProductApplicationApiTest :
    ApiSpec({
        beforeEach { truncate("flex.product_type", "flex.party", "flex.entity") }

        suspend fun create(setup: Setup, kind: String, fields: String): ApiResponse =
            api.request(HttpMethod.Post, PATH, setup.sp.token(), setup.create(kind, fields))

        test("an SP creates an FCR-N application, which has no assessment yet") {
            val setup = seedSetup()

            val response = create(setup, FCR_N, """"application_details": ${fcr(FCR_N, 1000, 1000)}""")

            response.status shouldBe HttpStatusCode.Created
            response.field("application_details").jsonObject.getValue("kind") shouldBe JsonPrimitive(FCR_N)
            response.field("assessment_details") shouldBe JsonNull
        }

        test("FCR-N with different up and down values is rejected, FCR-D is accepted") {
            val setup = seedSetup()

            val rejected = create(setup, FCR_N, """"application_details": ${fcr(FCR_N, 1000, 900)}""")
            rejected.status shouldBe HttpStatusCode.BadRequest
            rejected.field("code") shouldBe JsonPrimitive("PT400")
            rejected.text shouldContain "must be equal"

            create(setup, FCR_D, """"application_details": ${fcr(FCR_D, 800, 600)}""").status shouldBe HttpStatusCode.Created
        }

        test("the details are required, and must be of the product type") {
            val setup = seedSetup()

            create(setup, FCR_N, """"status": "requested"""").text shouldContain "application_details is required"
            create(setup, FCR_N, """"application_details": ${fcr(FCR_D, 1, 1)}""").text shouldContain
                "application_details.kind must be $FCR_N"
        }

        test("an application has exactly one product type") {
            val setup = seedSetup()
            val ids = setup.productTypeIds.values.take(2).joinToString()

            val response = api.request(
                HttpMethod.Post,
                PATH,
                setup.sp.token(),
                """{"service_providing_group_id": ${setup.spgId}, "procuring_system_operator_id": ${setup.so.partyId},
                    "product_type_ids": [$ids], "application_details": ${mfrr(1)}}""",
            )

            response.status shouldBe HttpStatusCode.BadRequest
            response.text shouldContain "product_type_ids must contain exactly one product type"
        }

        test("an mFRR application made with the deprecated columns gets application details") {
            val setup = seedSetup()

            val response = create(
                setup,
                MFRR,
                """"maximum_active_power_up": 5, "maximum_active_power_down": 6, "ramping_capability": "always",
                   "ramping_description": "Ramps"""",
            )

            response.status shouldBe HttpStatusCode.Created
            val details = response.field("application_details").jsonObject
            details.getValue("kind") shouldBe JsonPrimitive(MFRR)
            details.getValue("maximum_active_power_down").jsonPrimitive.content shouldBe "6"
            details.getValue("ramping_description") shouldBe JsonPrimitive("Ramps")
        }

        test("an mFRR application made with details gets the deprecated columns") {
            val setup = seedSetup()

            val response = create(setup, MFRR, """"application_details": ${mfrr(7)}""")

            response.status shouldBe HttpStatusCode.Created
            response.field("ramping_capability") shouldBe JsonPrimitive("partial")
            response.field("maximum_active_power_up").jsonPrimitive.content.toBigDecimal() shouldBe 7.toBigDecimal().setScale(3)
        }

        test("updating a deprecated column of an mFRR application updates the details too") {
            val setup = seedSetup()
            val id = create(setup, MFRR, """"application_details": ${mfrr(7)}""").field("id").jsonPrimitive.content

            val response = api.request(
                HttpMethod.Patch,
                "$PATH/$id",
                setup.sp.token(),
                """{"ramping_description": "Changed"}""",
            )

            response.status shouldBe HttpStatusCode.OK
            response.field("application_details").jsonObject.getValue("ramping_description") shouldBe JsonPrimitive("Changed")
        }

        test("deprecated columns that conflict with the application details are rejected") {
            val setup = seedSetup()

            val response = create(
                setup,
                MFRR,
                """"application_details": ${mfrr(7)}, "ramping_description": "Other"""",
            )

            response.status shouldBe HttpStatusCode.BadRequest
            response.text shouldContain "ramping_description conflicts with application_details.ramping_description"
        }

        test("the deprecated columns are not accepted for other product types") {
            val setup = seedSetup()

            val response = create(setup, FCR_N, """"application_details": ${fcr(FCR_N, 1, 1)}, "ramping_description": "x"""")

            response.status shouldBe HttpStatusCode.BadRequest
            response.text shouldContain "ramping_description is only supported for kind $MFRR"
        }

        test("the SO answers with assessment details, which must match the application") {
            val setup = seedSetup()
            val id = create(setup, FCR_D, """"application_details": ${fcr(FCR_D, 800, 600)}""").field("id").jsonPrimitive.content
            val assessment = """"kind": "$FCR_D", "approved_maximum_active_power_up": 700, "approved_maximum_active_power_down": 500"""

            val mismatch = api.request(
                HttpMethod.Patch,
                "$PATH/$id",
                setup.so.token(),
                """{"assessment_details": {${assessment.replace(FCR_D, FCR_N)}}}""",
            )
            mismatch.status shouldBe HttpStatusCode.BadRequest
            mismatch.text shouldContain "assessment_details.kind must be $FCR_D"

            val response = api.request(HttpMethod.Patch, "$PATH/$id", setup.so.token(), """{"assessment_details": {$assessment}}""")
            response.status shouldBe HttpStatusCode.OK
            response.field("assessment_details").jsonObject.getValue("approved_maximum_active_power_up").jsonPrimitive.content shouldBe "700"
        }

        test("an SP cannot write assessment details") {
            val setup = seedSetup()
            val id = create(setup, FCR_D, """"application_details": ${fcr(FCR_D, 800, 600)}""").field("id").jsonPrimitive.content

            val response = api.request(
                HttpMethod.Patch,
                "$PATH/$id",
                setup.sp.token(),
                """{"assessment_details": {"kind": "$FCR_D", "approved_maximum_active_power_up": 1, "approved_maximum_active_power_down": 1}}""",
            )

            response.status shouldBe HttpStatusCode.Forbidden
        }

        test("an update that does not touch the details is not validated") {
            val setup = seedSetup()
            val id = create(setup, FCR_N, """"application_details": ${fcr(FCR_N, 1, 1)}""").field("id").jsonPrimitive.content

            val response = api.request(HttpMethod.Patch, "$PATH/$id", setup.sp.token(), """{"status": "inactive"}""")

            response.status shouldBe HttpStatusCode.OK
        }
    })
