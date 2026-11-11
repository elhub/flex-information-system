package no.elhub.flex.api.productapplication

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.KSerializer
import no.elhub.flex.api.model.dto.generated.models.SpgpaApplicationDetails
import no.elhub.flex.api.model.dto.generated.models.SpgpaApplicationDetailsFcrD
import no.elhub.flex.api.model.dto.generated.models.SpgpaApplicationDetailsFcrN
import no.elhub.flex.api.model.dto.generated.models.SpgpaApplicationDetailsMfrr
import no.elhub.flex.api.model.dto.generated.models.SpgpaAssessmentDetails
import no.elhub.flex.api.model.dto.generated.models.SpgpaAssessmentDetailsFcrD
import no.elhub.flex.api.model.dto.generated.models.SpgpaAssessmentDetailsFcrN
import java.math.BigDecimal

/** The product type (`kind`) whose application details are mirrored in the deprecated columns. */
const val MFRR_KIND = "manual_frequency_restoration"

private val MAX_POWER = BigDecimal("999999.999")
private const val MAX_POWER_SCALE = 3
private const val MAX_ADDITIONAL_INFORMATION_LENGTH = 512

/**
 * The product types that have application and assessment details, derived from the generated models: the serial
 * name of each variant is the `business_id` of its product type.
 */
@OptIn(ExperimentalSerializationApi::class)
object ProductVariants {
    val applicationKinds: Set<String> = kindsOf(SpgpaApplicationDetails.serializer())
    val assessmentKinds: Set<String> = kindsOf(SpgpaAssessmentDetails.serializer())

    // the second element of a sealed class descriptor holds one element per subclass, named after its serial name
    private fun kindsOf(serializer: KSerializer<*>): Set<String> =
        serializer.descriptor.getElementDescriptor(1).let { value -> (0 until value.elementsCount).map { value.getElementName(it) } }.toSet()
}

/** The problems of these application details, as `application_details.<field> ...` messages. */
fun SpgpaApplicationDetails.errors(path: String = "application_details"): List<String> =
    when (this) {
        is SpgpaApplicationDetailsMfrr ->
            power(path, "maximum_active_power_up", maximumActivePowerUp) +
                power(path, "maximum_active_power_down", maximumActivePowerDown) +
                notEmpty(path, "ramping_description", rampingDescription) +
                maxLength(path, "additional_information", additionalInformation, MAX_ADDITIONAL_INFORMATION_LENGTH)

        is SpgpaApplicationDetailsFcrN ->
            power(path, "maximum_active_power_up", maximumActivePowerUp) +
                power(path, "maximum_active_power_down", maximumActivePowerDown) +
                notEmpty(path, "service_provider_contact_information", serviceProviderContactInformation) +
                notEmpty(path, "technical_contact_information", technicalContactInformation) +
                equal(path, "maximum_active_power_up", maximumActivePowerUp, "maximum_active_power_down", maximumActivePowerDown)

        is SpgpaApplicationDetailsFcrD ->
            power(path, "maximum_active_power_up", maximumActivePowerUp) +
                power(path, "maximum_active_power_down", maximumActivePowerDown) +
                notEmpty(path, "service_provider_contact_information", serviceProviderContactInformation) +
                notEmpty(path, "technical_contact_information", technicalContactInformation)
    }

/** The problems of these assessment details, as `assessment_details.<field> ...` messages. */
fun SpgpaAssessmentDetails.errors(path: String = "assessment_details"): List<String> =
    when (this) {
        is SpgpaAssessmentDetailsFcrN ->
            power(path, "approved_maximum_active_power_up", approvedMaximumActivePowerUp) +
                power(path, "approved_maximum_active_power_down", approvedMaximumActivePowerDown) +
                equal(
                    path,
                    "approved_maximum_active_power_up",
                    approvedMaximumActivePowerUp,
                    "approved_maximum_active_power_down",
                    approvedMaximumActivePowerDown,
                )

        is SpgpaAssessmentDetailsFcrD ->
            power(path, "approved_maximum_active_power_up", approvedMaximumActivePowerUp) +
                power(path, "approved_maximum_active_power_down", approvedMaximumActivePowerDown)
    }

private fun power(path: String, field: String, value: BigDecimal): List<String> =
    buildList {
        if (value < BigDecimal.ZERO) add("$path.$field must be at least 0")
        if (value > MAX_POWER) add("$path.$field must be at most $MAX_POWER")
        if (value.stripTrailingZeros().scale() > MAX_POWER_SCALE) add("$path.$field must be a multiple of 0.001")
    }

private fun notEmpty(path: String, field: String, value: String): List<String> =
    if (value.isEmpty()) listOf("$path.$field must have at least 1 character(s)") else emptyList()

private fun maxLength(path: String, field: String, value: String?, max: Int): List<String> =
    if (value != null && value.length > max) listOf("$path.$field must have at most $max character(s)") else emptyList()

private fun equal(path: String, first: String, firstValue: BigDecimal, second: String, secondValue: BigDecimal): List<String> =
    if (firstValue.compareTo(secondValue) != 0) listOf("$path.$first and $path.$second must be equal") else emptyList()
