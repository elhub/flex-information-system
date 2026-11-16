package no.elhub.flex.api.productapplication

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement

private const val MFRR = "manual_frequency_restoration"
private const val FCR_N = "automatic_frequency_containment"
private const val FCR_D = "automatic_frequency_containment_disturbance"

private fun json(text: String): JsonElement = Json.parseToJsonElement(text)

private fun fcr(kind: String, up: String = "1000", down: String = "1000", extra: String = "") =
    json(
        """
        {
          "kind": "$kind",
          "service_provider_contact_information": "Kari",
          "technical_contact_information": "Ola",
          "limited_energy_reservoir": true,
          "variable_production_consumption": false,
          "planned_prequalification_test_date": "2026-12-01",
          "maximum_active_power_up": $up,
          "maximum_active_power_down": $down
          $extra
        }
        """,
    )

private val mfrr = json(
    """
    {
      "kind": "$MFRR",
      "maximum_active_power_up": 150.5,
      "maximum_active_power_down": 150.5,
      "ramping_capability": "partial",
      "ramping_description": "One by one"
    }
    """,
)

private fun assessment(kind: String, up: String = "900", down: String = "900") =
    json("""{"kind": "$kind", "approved_maximum_active_power_up": $up, "approved_maximum_active_power_down": $down}""")

class ProductApplicationDetailsTest :
    FunSpec({
        test("the variants come from the generated models") {
            ProductVariants.application shouldBe setOf(MFRR, FCR_N, FCR_D)
            ProductVariants.assessment shouldBe setOf(FCR_N, FCR_D)
        }

        test("valid details are accepted") {
            validateDetails(MFRR, mfrr, null).shouldBeEmpty()
            validateDetails(FCR_N, fcr(FCR_N), assessment(FCR_N)).shouldBeEmpty()
            validateDetails(FCR_D, fcr(FCR_D, "800", "600"), assessment(FCR_D, "700", "500")).shouldBeEmpty()
        }

        test("product types without a variant have no details") {
            validateDetails("manual_frequency_restoration_disruption", null, null).shouldBeEmpty()
            validateDetails("manual_frequency_restoration_disruption", mfrr, null) shouldBe
                listOf("application_details is not allowed for kind manual_frequency_restoration_disruption")
        }

        test("application details are required when the product type has them") {
            validateDetails(FCR_N, null, null) shouldBe listOf("application_details is required")
        }

        test("assessment details are not allowed for mFRR") {
            validateDetails(MFRR, mfrr, assessment(MFRR)) shouldBe listOf("assessment_details is not allowed for kind $MFRR")
        }

        test("the kind must be the one of the product type") {
            validateDetails(FCR_N, fcr(FCR_D), null) shouldBe listOf("application_details.kind must be $FCR_N")
            validateDetails(FCR_N, fcr(FCR_N), assessment(FCR_D)) shouldBe listOf("assessment_details.kind must be $FCR_N")
        }

        test("FCR-N needs equal up and down values, FCR-D does not") {
            validateDetails(FCR_N, fcr(FCR_N, "1000", "900"), null) shouldBe
                listOf("application_details.maximum_active_power_up and maximum_active_power_down must be equal")
            validateDetails(FCR_N, fcr(FCR_N), assessment(FCR_N, "900", "800")) shouldBe
                listOf("assessment_details.approved_maximum_active_power_up and approved_maximum_active_power_down must be equal")
            validateDetails(FCR_N, fcr(FCR_N, "1000", "1000.0"), null).shouldBeEmpty()
        }

        test("required fields, unknown fields, wrong types and unknown enum values are rejected") {
            validateDetails(FCR_N, json("""{"kind": "$FCR_N"}"""), null).size shouldBe 1
            validateDetails(FCR_D, fcr(FCR_D, extra = ""","unknown": 1"""), null).size shouldBe 1
            validateDetails(FCR_D, fcr(FCR_D, up = "\"1000\""), null).size shouldBe 1
            validateDetails(MFRR, json(mfrr.toString().replace("partial", "sometimes")), null).size shouldBe 1
        }

        test("dates must exist") {
            validateDetails(FCR_D, json(fcr(FCR_D).toString().replace("2026-12-01", "2026-02-31")), null).size shouldBe 1
        }

        test("ranges, decimals and lengths are checked") {
            validateDetails(FCR_D, fcr(FCR_D, "-1", "1"), null) shouldBe
                listOf("application_details.maximum_active_power_up must be between 0 and 999999.999")
            validateDetails(FCR_D, fcr(FCR_D, "1000000", "1"), null).size shouldBe 1
            validateDetails(FCR_D, fcr(FCR_D, "1.0001", "1"), null) shouldBe
                listOf("application_details.maximum_active_power_up must have at most 3 decimals")
            validateDetails(
                MFRR,
                json(mfrr.toString().dropLast(1) + ""","additional_information": "${"a".repeat(513)}"}"""),
                null,
            ) shouldBe listOf("application_details.additional_information must be at most 512 characters long")
        }
    })
