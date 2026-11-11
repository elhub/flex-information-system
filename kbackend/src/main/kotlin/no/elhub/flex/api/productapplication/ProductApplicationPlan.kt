package no.elhub.flex.api.productapplication

import arrow.core.Either
import arrow.core.raise.either
import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationUpdateRequest
import no.elhub.flex.api.model.dto.generated.models.SpgpaApplicationDetails
import no.elhub.flex.api.model.dto.generated.models.SpgpaApplicationDetailsMfrr
import no.elhub.flex.api.model.dto.generated.models.SpgpaAssessmentDetails
import no.elhub.flex.shared.http.AppError
import no.elhub.flex.shared.http.ParsingError
import java.math.BigDecimal

/** A value to write in a column of the resource, as text with the SQL type to cast it to. */
data class Column(val value: String?, val cast: String)

private const val APPLICATION_DETAILS = "application_details"
private const val ASSESSMENT_DETAILS = "assessment_details"
private const val PRODUCT_TYPE_IDS = "product_type_ids"

private val POWER_FIELDS = setOf("maximum_active_power_up", "maximum_active_power_down")

/** The deprecated columns that are replaced by `application_details`, and kept in sync with it for mFRR. */
val LEGACY_FIELDS = listOf(
    "maximum_active_power_up",
    "maximum_active_power_down",
    "ramping_capability",
    "ramping_description",
    "additional_information",
)

private val COLUMN_CASTS = mapOf(
    "service_providing_group_id" to "bigint",
    "procuring_system_operator_id" to "bigint",
    PRODUCT_TYPE_IDS to "bigint[]",
    "status" to "text",
    "maximum_active_power_up" to "numeric",
    "maximum_active_power_down" to "numeric",
    "additional_information" to "text",
    "prequalified_at" to "timestamptz",
    "verified_at" to "timestamptz",
    "ramping_capability" to "text",
    "ramping_description" to "text",
    "complete_at" to "timestamptz",
    APPLICATION_DETAILS to "jsonb",
    ASSESSMENT_DETAILS to "jsonb",
)

/**
 * Checks that [body] has the right shape for a create or an update request: no unknown or read-only property,
 * and values of the right types, enumerations and formats. The details are decoded as their variant.
 */
fun checkBodyShape(body: JsonObject, create: Boolean): Either<AppError, Unit> =
    Either.catch {
        if (create) {
            strictJson.decodeFromJsonElement(ServiceProvidingGroupProductApplicationCreateRequest.serializer(), body)
        } else {
            strictJson.decodeFromJsonElement(ServiceProvidingGroupProductApplicationUpdateRequest.serializer(), body)
        }
        Unit
    }.mapLeft { e ->
        when (e) {
            is SerializationException, is IllegalArgumentException -> ParsingError("Invalid request body: ${e.firstLine()}")
            else -> throw e
        }
    }

/** VAL012: the product types of the request must be exactly one. */
fun checkSingleProductType(body: JsonObject): Either<AppError, Unit> =
    either {
        val ids = body[PRODUCT_TYPE_IDS]?.takeIf { it !is JsonNull }?.jsonArray
        if (ids != null && ids.size != 1) {
            raise(ParsingError("product_type_ids must contain exactly one product type"))
        }
    }

/** The product type ids of the request, or else of the [current] application. */
fun effectiveProductTypeIds(body: JsonObject, current: JsonObject?): List<Long> =
    (body[PRODUCT_TYPE_IDS] ?: current?.get(PRODUCT_TYPE_IDS))
        ?.takeIf { it !is JsonNull }
        ?.jsonArray
        ?.map { it.jsonPrimitive.content.toLong() }
        .orEmpty()

/**
 * Decides what to write for a create or update request.
 *
 * The properties of the request that are present are written as such. In addition:
 *
 * - The details are checked against the variant of the product type [kind], including their fields, and the
 *   deprecated columns are kept in sync with `application_details` for mFRR. Writing the deprecated columns instead of
 *   `application_details` is supported for mFRR, and updates the details accordingly.
 * - The details are only checked again when they, the deprecated columns or the product type are in the request.
 *
 * @param body the (shape-checked) request body
 * @param current the current application as JSON for an update, `null` for a create
 * @param kind the `business_id` of the product type of the application, if it has exactly one
 */
fun planWrite(body: JsonObject, current: JsonObject?, kind: String?): Either<AppError, Map<String, Column>> =
    either {
        val create = current == null
        val columns = LinkedHashMap<String, Column>()

        for ((field, value) in body) {
            if (field == APPLICATION_DETAILS || field == ASSESSMENT_DETAILS) continue
            columns[field] = column(field, value)
        }

        val productTypeChanged = PRODUCT_TYPE_IDS in body
        val legacyInBody = LEGACY_FIELDS.filter { it in body }

        if (create || productTypeChanged || APPLICATION_DETAILS in body || legacyInBody.isNotEmpty()) {
            val application = applicationDetails(body, current, kind, legacyInBody).bind()
            when {
                application == null -> {
                    if (APPLICATION_DETAILS in body) columns[APPLICATION_DETAILS] = Column(null, "jsonb")
                    if (current != null && LEGACY_FIELDS.any { current.isSet(it) }) {
                        LEGACY_FIELDS.forEach { columns.putIfAbsent(it, Column(null, COLUMN_CASTS.getValue(it))) }
                    }
                }

                else -> {
                    columns[APPLICATION_DETAILS] = Column(application.json.toString(), "jsonb")
                    if (application.decoded is SpgpaApplicationDetailsMfrr) {
                        columns.putAll(legacyColumns(application.decoded))
                    } else if (current != null && LEGACY_FIELDS.any { current.isSet(it) }) {
                        LEGACY_FIELDS.forEach { columns[it] = Column(null, COLUMN_CASTS.getValue(it)) }
                    }
                }
            }
        }

        if (create || productTypeChanged || ASSESSMENT_DETAILS in body) {
            val assessment = assessmentDetails(body, current, kind).bind()
            if (assessment != null) {
                columns[ASSESSMENT_DETAILS] = Column(assessment.toString(), "jsonb")
            } else if (ASSESSMENT_DETAILS in body) {
                columns[ASSESSMENT_DETAILS] = Column(null, "jsonb")
            }
        }

        columns
    }

private class ValidApplication(val json: JsonObject, val decoded: SpgpaApplicationDetails)

private fun applicationDetails(
    body: JsonObject,
    current: JsonObject?,
    kind: String?,
    legacyInBody: List<String>,
): Either<AppError, ValidApplication?> =
    either {
        val inBody = APPLICATION_DETAILS in body
        var details: JsonObject? =
            (if (inBody) body[APPLICATION_DETAILS] else current?.get(APPLICATION_DETAILS)) as? JsonObject

        if (legacyInBody.isNotEmpty()) {
            if (kind != MFRR_KIND) {
                raise(
                    ParsingError(
                        "${LEGACY_FIELDS.joinToString(", ")} are deprecated and only allowed for $MFRR_KIND. " +
                            "Use application_details instead",
                    ),
                )
            }
            val base = details
            details = if (inBody && base != null) {
                if (legacyInBody.any { !sameValue(it, body.getValue(it), base[it]) }) {
                    raise(ParsingError("the deprecated columns conflict with application_details. Set only application_details"))
                }
                base
            } else {
                buildJsonObject {
                    put("kind", MFRR_KIND)
                    (base ?: JsonObject(emptyMap())).forEach { (key, value) ->
                        if (key !in legacyInBody && key != "kind") put(key, value)
                    }
                    legacyInBody.forEach { put(it, body.getValue(it)) }
                }
            }
        }

        if (kind == null) {
            raise(ParsingError("product_type_ids must contain exactly one product type"))
        }

        if (kind !in ProductVariants.applicationKinds) {
            if (details != null) raise(ParsingError("application_details is not allowed for kind $kind"))
            return@either null
        }
        val required = details ?: raise(ParsingError("application_details is required"))
        if ((required["kind"] as? JsonPrimitive)?.content != kind) {
            raise(ParsingError("application_details.kind must be $kind"))
        }

        val stripped = JsonObject(required.filterValues { it !is JsonNull })
        val decoded = decode(SpgpaApplicationDetails.serializer(), stripped, APPLICATION_DETAILS).bind()
        decoded.errors().takeIf { it.isNotEmpty() }?.let { raise(ParsingError(it.joinToString("; "))) }
        ValidApplication(stripped, decoded)
    }

private fun assessmentDetails(body: JsonObject, current: JsonObject?, kind: String?): Either<AppError, JsonObject?> =
    either {
        val inBody = ASSESSMENT_DETAILS in body
        val details = (if (inBody) body[ASSESSMENT_DETAILS] else current?.get(ASSESSMENT_DETAILS)) as? JsonObject
            ?: return@either null

        if (kind == null) raise(ParsingError("product_type_ids must contain exactly one product type"))
        if (kind !in ProductVariants.assessmentKinds) raise(ParsingError("assessment_details is not allowed for kind $kind"))
        if ((details["kind"] as? JsonPrimitive)?.content != kind) raise(ParsingError("assessment_details.kind must be $kind"))

        val stripped = JsonObject(details.filterValues { it !is JsonNull })
        val decoded = decode(SpgpaAssessmentDetails.serializer(), stripped, ASSESSMENT_DETAILS).bind()
        decoded.errors().takeIf { it.isNotEmpty() }?.let { raise(ParsingError(it.joinToString("; "))) }
        stripped
    }

private fun <T> decode(
    serializer: KSerializer<T>,
    json: JsonObject,
    path: String,
): Either<AppError, T> =
    Either.catch { strictJson.decodeFromJsonElement(serializer, json) }
        .mapLeft { e ->
            when (e) {
                is SerializationException, is IllegalArgumentException -> ParsingError("$path: ${e.firstLine()}")
                else -> throw e
            }
        }

private fun column(field: String, value: JsonElement): Column {
    val cast = COLUMN_CASTS.getValue(field)
    return when {
        value is JsonNull -> Column(null, cast)
        value is JsonArray -> Column(value.joinToString(",", "{", "}") { it.jsonPrimitive.content }, cast)
        else -> Column(value.jsonPrimitive.content, cast)
    }
}

private fun legacyColumns(details: SpgpaApplicationDetailsMfrr): Map<String, Column> =
    mapOf(
        "maximum_active_power_up" to Column(details.maximumActivePowerUp.toPlainString(), "numeric"),
        "maximum_active_power_down" to Column(details.maximumActivePowerDown.toPlainString(), "numeric"),
        "ramping_capability" to Column(details.rampingCapability.value, "text"),
        "ramping_description" to Column(details.rampingDescription, "text"),
        "additional_information" to Column(details.additionalInformation, "text"),
    )

private fun JsonObject.isSet(field: String): Boolean = this[field]?.let { it !is JsonNull } ?: false

private fun sameValue(field: String, legacy: JsonElement, details: JsonElement?): Boolean {
    val left = (legacy as? JsonPrimitive)?.textOrNull()
    val right = (details as? JsonPrimitive)?.textOrNull()
    if (left == null || right == null) return left == right
    return if (field in POWER_FIELDS) {
        runCatching { BigDecimal(left).compareTo(BigDecimal(right)) == 0 }.getOrDefault(false)
    } else {
        left == right
    }
}
