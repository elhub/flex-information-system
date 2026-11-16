package no.elhub.flex.api.productapplication

import arrow.core.Either
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject

private const val MFRR = "manual_frequency_restoration"

private fun obj(text: String): JsonObject = Json.parseToJsonElement(text).jsonObject

class LegacyColumnsTest :
    FunSpec({
        test("details are made from the columns") {
            val body = obj(
                """{"maximum_active_power_up": 1, "maximum_active_power_down": 2, "ramping_capability": "always",
                    "ramping_description": "d"}""",
            )

            syncLegacyColumns(MFRR, body, null) shouldBe Either.Right(
                JsonObject(
                    body + (
                        "application_details" to obj(
                            """{"kind": "$MFRR", "maximum_active_power_up": 1, "maximum_active_power_down": 2,
                            "ramping_capability": "always", "ramping_description": "d"}""",
                        )
                        ),
                ),
            )
        }

        test("an updated column is merged into the stored details, and null removes it") {
            val existing = obj("""{"kind": "$MFRR", "ramping_description": "d", "additional_information": "x"}""")

            val result = syncLegacyColumns(MFRR, obj("""{"additional_information": null, "ramping_description": "e"}"""), existing)

            result.getOrNull()!!.getValue("application_details") shouldBe obj("""{"kind": "$MFRR", "ramping_description": "e"}""")
        }

        test("the columns are made from the details") {
            val body = obj("""{"application_details": {"kind": "$MFRR", "maximum_active_power_up": 1, "ramping_description": "d"}}""")

            val result = syncLegacyColumns(MFRR, body, null).getOrNull()!!

            result["maximum_active_power_up"] shouldBe body.getValue("application_details").jsonObject["maximum_active_power_up"]
            result["ramping_description"] shouldBe body.getValue("application_details").jsonObject["ramping_description"]
            result["additional_information"] shouldBe kotlinx.serialization.json.JsonNull
        }

        test("columns and details that agree are accepted, also when written differently") {
            val body = obj("""{"maximum_active_power_up": 1.0, "application_details": {"kind": "$MFRR", "maximum_active_power_up": 1}}""")

            syncLegacyColumns(MFRR, body, null).isRight() shouldBe true
        }

        test("columns and details that disagree are rejected") {
            val body = obj("""{"maximum_active_power_up": 2, "application_details": {"kind": "$MFRR", "maximum_active_power_up": 1}}""")

            syncLegacyColumns(MFRR, body, null) shouldBe
                Either.Left("maximum_active_power_up conflicts with application_details.maximum_active_power_up")
        }

        test("a request without columns is left alone") {
            val body = obj("""{"status": "inactive"}""")

            syncLegacyColumns(MFRR, body, null) shouldBe Either.Right(body)
        }

        test("other product types do not have the columns") {
            syncLegacyColumns("automatic_frequency_containment", obj("""{"ramping_capability": "always"}"""), null) shouldBe
                Either.Left("ramping_capability is only supported for kind $MFRR")
            syncLegacyColumns("automatic_frequency_containment", obj("""{"ramping_capability": null}"""), null).isRight() shouldBe true
        }
    })
