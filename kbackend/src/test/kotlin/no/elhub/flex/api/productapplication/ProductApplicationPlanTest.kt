package no.elhub.flex.api.productapplication

import arrow.core.Either
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import no.elhub.flex.shared.http.AppError

private const val FCR_N = "automatic_frequency_containment"
private const val FCR_D = "automatic_frequency_containment_disturbance"

private fun json(text: String): JsonObject = strictJson.parseToJsonElement(text).jsonObject

private fun Either<AppError, Map<String, Column>>.columns() = (this as Either.Right).value

private fun Either<AppError, *>.error(): String = (this as Either.Left).value.message

private const val MFRR_DETAILS = """
    "kind": "manual_frequency_restoration",
    "maximum_active_power_up": 3.5,
    "maximum_active_power_down": 2,
    "ramping_capability": "always",
    "ramping_description": "One by one"
"""

private const val FCR_DETAILS = """
    "service_provider_contact_information": "Kari",
    "technical_contact_information": "Ola",
    "limited_energy_reservoir": true,
    "variable_production_consumption": false,
    "planned_prequalification_test_date": "2026-12-01"
"""

class ProductApplicationPlanTest :
    FunSpec({
        test("the variants are the product types of the generated models") {
            ProductVariants.applicationKinds shouldBe setOf(MFRR_KIND, FCR_N, FCR_D)
            ProductVariants.assessmentKinds shouldBe setOf(FCR_N, FCR_D)
        }

        context("body shape") {
            test("unknown and read-only properties are rejected") {
                checkBodyShape(json("""{"service_providing_group_id": 1, "procuring_system_operator_id": 2, "product_type_ids": [3], "id": 4}"""), true)
                    .error() shouldContain "id"
            }
            test("read-only and non-updatable properties are rejected on update") {
                checkBodyShape(json("""{"service_providing_group_id": 1}"""), false).error() shouldContain "service_providing_group_id"
            }
            test("numbers must be numbers") {
                val body = """"kind": "$FCR_D", $FCR_DETAILS, "maximum_active_power_up": "1", "maximum_active_power_down": 1"""
                checkBodyShape(json("""{"application_details": {$body}}"""), false).error() shouldContain "number"
            }
            test("exactly one product type") {
                checkSingleProductType(json("""{"product_type_ids": [1, 2]}""")).error() shouldContain "exactly one"
                checkSingleProductType(json("""{"product_type_ids": []}""")).error() shouldContain "exactly one"
                checkSingleProductType(json("""{"product_type_ids": [1]}""")) shouldBe Either.Right(Unit)
            }
        }

        context("application details") {
            test("mFRR details are written, with the deprecated columns in sync") {
                val columns = planWrite(
                    json("""{"product_type_ids": [8], "application_details": {$MFRR_DETAILS}}"""),
                    null,
                    MFRR_KIND,
                ).columns()
                columns.getValue("maximum_active_power_up").value shouldBe "3.5"
                columns.getValue("ramping_capability").value shouldBe "always"
                columns.getValue("application_details").cast shouldBe "jsonb"
                columns.getValue("product_type_ids").value shouldBe "{8}"
            }
            test("required for a product type with a variant, not allowed for another") {
                planWrite(json("""{"product_type_ids": [8]}"""), null, MFRR_KIND).error() shouldBe "application_details is required"
                planWrite(
                    json("""{"product_type_ids": [5], "application_details": {$MFRR_DETAILS}}"""),
                    null,
                    "manual_congestion",
                ).error() shouldBe "application_details is not allowed for kind manual_congestion"
                planWrite(json("""{"product_type_ids": [5]}"""), null, "manual_congestion").columns().keys shouldBe setOf("product_type_ids")
            }
            test("the kind must be the product type") {
                planWrite(
                    json("""{"application_details": {$MFRR_DETAILS}}"""),
                    null,
                    FCR_N,
                ).error() shouldBe "application_details.kind must be $FCR_N"
            }
            test("fields are checked, all errors at once") {
                val error = planWrite(
                    json("""{"application_details": {"kind": "$FCR_D", $FCR_DETAILS, "maximum_active_power_up": -1, "maximum_active_power_down": 1.0005}}"""),
                    null,
                    FCR_D,
                ).error()
                error shouldContain "application_details.maximum_active_power_up must be at least 0"
                error shouldContain "application_details.maximum_active_power_down must be a multiple of 0.001"
            }
            test("FCR-N up and down must be equal, FCR-D not") {
                val details = """"kind": "$FCR_N", $FCR_DETAILS, "maximum_active_power_up": 5, "maximum_active_power_down": 6"""
                planWrite(json("""{"application_details": {$details}}"""), null, FCR_N).error() shouldContain "must be equal"
                planWrite(
                    json("""{"application_details": {${details.replace(FCR_N, FCR_D)}}}"""),
                    null,
                    FCR_D,
                ).columns().containsKey("application_details") shouldBe true
            }
            test("nothing is checked when the details are not touched") {
                val current = json("""{"product_type_ids": [8], "application_details": null}""")
                planWrite(json("""{"status": "inactive"}"""), current, MFRR_KIND).columns().keys shouldBe setOf("status")
            }
        }

        context("deprecated columns") {
            test("create an mFRR application with the deprecated columns only") {
                val columns = planWrite(
                    json(
                        """{"product_type_ids": [8], "maximum_active_power_up": 1.5, "maximum_active_power_down": 1.5,
                            "ramping_capability": "never", "ramping_description": "No"}""",
                    ),
                    null,
                    MFRR_KIND,
                ).columns()
                val details = json(columns.getValue("application_details").value!!)
                details["kind"].toString() shouldBe "\"$MFRR_KIND\""
                details["ramping_capability"].toString() shouldBe "\"never\""
            }
            test("updating a deprecated column updates the details") {
                val current = json("""{"product_type_ids": [8], "application_details": {$MFRR_DETAILS}}""")
                val columns = planWrite(json("""{"maximum_active_power_up": 9}"""), current, MFRR_KIND).columns()
                val details = json(columns.getValue("application_details").value!!)
                details["maximum_active_power_up"].toString() shouldBe "9"
                details["maximum_active_power_down"].toString() shouldBe "2"
                columns.getValue("maximum_active_power_down").value shouldBe "2"
            }
            test("conflicting values are rejected, equal values accepted") {
                val conflict = """{"maximum_active_power_up": 1, "application_details": {$MFRR_DETAILS}}"""
                planWrite(json(conflict), null, MFRR_KIND).error() shouldContain "conflict"
                val agree = """{"maximum_active_power_up": 3.50, "application_details": {$MFRR_DETAILS}}"""
                planWrite(json(agree), null, MFRR_KIND).columns().containsKey("application_details") shouldBe true
            }
            test("not allowed for other product types") {
                planWrite(
                    json("""{"product_type_ids": [6], "maximum_active_power_up": 1}"""),
                    null,
                    FCR_N,
                ).error() shouldContain "deprecated"
            }
            test("changing the product type away from mFRR clears them") {
                val current = json(
                    """{"product_type_ids": [8], "maximum_active_power_up": 3.5, "maximum_active_power_down": 2,
                        "ramping_capability": "always", "ramping_description": "x", "additional_information": null,
                        "application_details": {$MFRR_DETAILS}}""",
                )
                val body = """{"product_type_ids": [6], "application_details": {"kind": "$FCR_N", $FCR_DETAILS,
                    "maximum_active_power_up": 1, "maximum_active_power_down": 1}}"""
                val columns = planWrite(json(body), current, FCR_N).columns()
                columns.getValue("maximum_active_power_up").value shouldBe null
                columns.getValue("ramping_description").value shouldBe null
            }
        }

        context("assessment details") {
            val fcrN = """{"kind": "$FCR_N", "approved_maximum_active_power_up": 9, "approved_maximum_active_power_down": 9}"""
            val current = json("""{"product_type_ids": [6], "application_details": null}""")

            test("written for a product type with an assessment variant") {
                planWrite(json("""{"assessment_details": $fcrN}"""), current, FCR_N).columns().keys shouldBe setOf("assessment_details")
            }
            test("not allowed for mFRR") {
                planWrite(json("""{"assessment_details": $fcrN}"""), current, MFRR_KIND).error() shouldContain "not allowed for kind"
            }
            test("the kind must be the product type") {
                planWrite(json("""{"assessment_details": $fcrN}"""), current, FCR_D).error() shouldBe "assessment_details.kind must be $FCR_D"
            }
            test("FCR-N up and down must be equal") {
                planWrite(
                    json("""{"assessment_details": {"kind": "$FCR_N", "approved_maximum_active_power_up": 9, "approved_maximum_active_power_down": 8}}"""),
                    current,
                    FCR_N,
                ).error() shouldContain "must be equal"
            }
            test("can be cleared") {
                planWrite(json("""{"assessment_details": null}"""), current, FCR_N).columns().getValue("assessment_details").value shouldBe null
            }
        }
    })
