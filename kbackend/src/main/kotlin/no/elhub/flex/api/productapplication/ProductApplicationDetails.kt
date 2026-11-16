@file:OptIn(ExperimentalSerializationApi::class)

package no.elhub.flex.api.productapplication

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerializationException
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecoder
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.modules.SerializersModule
import no.elhub.flex.api.model.dto.generated.models.SpgpaApplicationDetails
import no.elhub.flex.api.model.dto.generated.models.SpgpaApplicationDetailsFcrD
import no.elhub.flex.api.model.dto.generated.models.SpgpaApplicationDetailsFcrN
import no.elhub.flex.api.model.dto.generated.models.SpgpaApplicationDetailsMfrr
import no.elhub.flex.api.model.dto.generated.models.SpgpaAssessmentDetails
import no.elhub.flex.api.model.dto.generated.models.SpgpaAssessmentDetailsFcrD
import no.elhub.flex.api.model.dto.generated.models.SpgpaAssessmentDetailsFcrN
import java.math.BigDecimal

private val MAXIMUM_ACTIVE_POWER = BigDecimal("999999.999")
private const val MAXIMUM_ACTIVE_POWER_SCALE = 3
private const val MAXIMUM_ADDITIONAL_INFORMATION_LENGTH = 512

/** A decimal that must be a JSON number, since the generated models cannot tell it from a string. */
private object JsonNumberSerializer : KSerializer<BigDecimal> {
    override val descriptor = PrimitiveSerialDescriptor("BigDecimal", PrimitiveKind.STRING)

    override fun serialize(encoder: Encoder, value: BigDecimal) = encoder.encodeString(value.toPlainString())

    override fun deserialize(decoder: Decoder): BigDecimal {
        val primitive = (decoder as JsonDecoder).decodeJsonElement().jsonPrimitive
        if (primitive.isString) throw SerializationException("expected a number")
        return BigDecimal(primitive.content)
    }
}

/** Strict: unknown fields, missing fields and wrong types are rejected, which is why details are decoded from text. */
private val json = Json {
    serializersModule = SerializersModule { contextual(BigDecimal::class, JsonNumberSerializer) }
}

/**
 * The product types (by business ID, which is the `kind` of the details) that have application details
 * and assessment details, as defined by the variants of the OpenAPI spec.
 */
object ProductVariants {
    val application: Set<String> = setOf(
        SpgpaApplicationDetailsMfrr.serializer().descriptor.serialName,
        SpgpaApplicationDetailsFcrN.serializer().descriptor.serialName,
        SpgpaApplicationDetailsFcrD.serializer().descriptor.serialName,
    )

    val assessment: Set<String> = setOf(
        SpgpaAssessmentDetailsFcrN.serializer().descriptor.serialName,
        SpgpaAssessmentDetailsFcrD.serializer().descriptor.serialName,
    )
}

/**
 * Validates the details of an application for the product type with business ID [productKind] (SPGPA-VAL013).
 * [application] and [assessment] are `null` when they are not set. Returns the problems found.
 */
fun validateDetails(productKind: String, application: JsonElement?, assessment: JsonElement?): List<String> =
    validateDetails("application_details", productKind, application, ProductVariants.application) {
        json.decodeFromString<SpgpaApplicationDetails>(it.toString()).problems()
    } + validateDetails("assessment_details", productKind, assessment, ProductVariants.assessment, required = false) {
        json.decodeFromString<SpgpaAssessmentDetails>(it.toString()).problems()
    }

private fun validateDetails(
    field: String,
    productKind: String,
    details: JsonElement?,
    kinds: Set<String>,
    required: Boolean = true,
    typedProblems: (JsonElement) -> List<String>,
): List<String> {
    val isSet = details != null && details !is JsonNull
    return when {
        productKind !in kinds -> if (isSet) listOf("$field is not allowed for kind $productKind") else emptyList()

        !isSet -> if (required) listOf("$field is required") else emptyList()

        details !is JsonObject -> listOf("$field must be an object")

        (details["kind"] as? JsonPrimitive)?.contentOrNull != productKind ->
            listOf("$field.kind must be $productKind")

        else -> try {
            typedProblems(details).map { "$field.$it" }
        } catch (e: SerializationException) {
            listOf("$field: ${e.message?.lineSequence()?.first()}")
        } catch (e: IllegalArgumentException) {
            listOf("$field: ${e.message?.lineSequence()?.first()}")
        }
    }
}

private fun SpgpaApplicationDetails.problems(): List<String> =
    when (this) {
        is SpgpaApplicationDetailsMfrr ->
            power("maximum_active_power_up", maximumActivePowerUp) +
                power("maximum_active_power_down", maximumActivePowerDown) +
                listOfNotNull(
                    "additional_information must be at most $MAXIMUM_ADDITIONAL_INFORMATION_LENGTH characters long"
                        .takeIf { (additionalInformation?.length ?: 0) > MAXIMUM_ADDITIONAL_INFORMATION_LENGTH },
                )

        is SpgpaApplicationDetailsFcrN ->
            power("maximum_active_power_up", maximumActivePowerUp) +
                power("maximum_active_power_down", maximumActivePowerDown) +
                equal("maximum_active_power_up", maximumActivePowerUp, "maximum_active_power_down", maximumActivePowerDown)

        is SpgpaApplicationDetailsFcrD ->
            power("maximum_active_power_up", maximumActivePowerUp) +
                power("maximum_active_power_down", maximumActivePowerDown)
    }

private fun SpgpaAssessmentDetails.problems(): List<String> =
    when (this) {
        is SpgpaAssessmentDetailsFcrN ->
            power("approved_maximum_active_power_up", approvedMaximumActivePowerUp) +
                power("approved_maximum_active_power_down", approvedMaximumActivePowerDown) +
                equal(
                    "approved_maximum_active_power_up",
                    approvedMaximumActivePowerUp,
                    "approved_maximum_active_power_down",
                    approvedMaximumActivePowerDown,
                )

        is SpgpaAssessmentDetailsFcrD ->
            power("approved_maximum_active_power_up", approvedMaximumActivePowerUp) +
                power("approved_maximum_active_power_down", approvedMaximumActivePowerDown)
    }

private fun power(name: String, value: BigDecimal): List<String> =
    listOfNotNull(
        "$name must be between 0 and $MAXIMUM_ACTIVE_POWER".takeIf { value.signum() < 0 || value > MAXIMUM_ACTIVE_POWER },
        "$name must have at most $MAXIMUM_ACTIVE_POWER_SCALE decimals".takeIf { value.stripTrailingZeros().scale() > MAXIMUM_ACTIVE_POWER_SCALE },
    )

private fun equal(nameA: String, a: BigDecimal, nameB: String, b: BigDecimal): List<String> =
    listOfNotNull("$nameA and $nameB must be equal".takeIf { a.compareTo(b) != 0 })
