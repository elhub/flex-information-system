package no.elhub.flex.api.productapplication

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import java.math.BigDecimal

private const val MFRR = "manual_frequency_restoration"
private const val APPLICATION_DETAILS = "application_details"

/** The deprecated columns that moved into the application details of mFRR applications. */
val legacyColumns = listOf(
    "maximum_active_power_up",
    "maximum_active_power_down",
    "ramping_capability",
    "ramping_description",
    "additional_information",
)

/**
 * Keeps the deprecated columns and `application_details` of the request [body] in sync, for the product type with
 * business ID [productKind]. [existingDetails] are the details currently stored, if the request updates an application.
 *
 * - only columns given: the details are made from the columns (on top of [existingDetails])
 * - only details given: the columns are made from the details
 * - both given: they must agree
 *
 * Other product types do not have the columns. Returns the body to store, or the problem found.
 */
fun syncLegacyColumns(productKind: String, body: JsonObject, existingDetails: JsonObject?): Either<String, JsonObject> {
    val given = legacyColumns.filter { it in body }

    if (productKind != MFRR) {
        val unsupported = given.firstOrNull { body[it] !is JsonNull }
        return if (unsupported == null) body.right() else "$unsupported is only supported for kind $MFRR".left()
    }

    if (given.isEmpty() && APPLICATION_DETAILS !in body) return body.right()

    if (APPLICATION_DETAILS !in body) {
        val details = (existingDetails ?: JsonObject(emptyMap())).toMutableMap()
        details["kind"] = JsonPrimitive(MFRR)
        given.forEach { column ->
            val value = body.getValue(column)
            if (value is JsonNull) details.remove(column) else details[column] = value
        }
        return JsonObject(body + (APPLICATION_DETAILS to JsonObject(details))).right()
    }

    val details = body[APPLICATION_DETAILS] as? JsonObject ?: return body.right() // reported when validating
    given.firstOrNull { !sameValue(body.getValue(it), details[it]) }?.let {
        return "$it conflicts with $APPLICATION_DETAILS.$it".left()
    }
    return JsonObject(body + legacyColumns.associateWith { details[it] ?: JsonNull }).right()
}

private fun sameValue(column: JsonElement, detail: JsonElement?): Boolean {
    val a = column as? JsonPrimitive
    val b = detail as? JsonPrimitive
    if (a == null || b == null || a.isString || b.isString) return column == (detail ?: JsonNull)
    return runCatching { BigDecimal(a.content).compareTo(BigDecimal(b.content)) == 0 }.getOrDefault(a == b)
}
