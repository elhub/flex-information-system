package no.elhub.flex.api.postgrest

import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage

private val json = Json { ignoreUnknownKeys = true }

/** The fields of an error response from PostgREST. */
@Serializable
private data class PostgrestError(
    val code: String? = null,
    val message: String? = null,
    // PostgREST sometimes sends structured values here, which we do not pass on
    val details: JsonElement? = null,
    val hint: JsonElement? = null,
)

/**
 * Turns an error response from PostgREST into our [ErrorMessage].
 *
 * Bodies that are not in PostgREST's error format get a generic message, and messages that would
 * reveal too much about PostgREST are replaced by more informative ones.
 */
fun rewritePostgrestError(method: HttpMethod, status: HttpStatusCode, body: String): ErrorMessage {
    val error = runCatching { json.decodeFromString<PostgrestError>(body) }.getOrNull()

    val code = error?.code
    if (error == null || code.isNullOrEmpty()) {
        return ErrorMessage(code = "HTTP${status.value}", message = "${status.value} ${status.description}")
    }

    return ErrorMessage(
        code = code,
        message = friendlyMessage(method, error.message.orEmpty()),
        details = error.details.text(),
        hint = error.hint.text(),
    )
}

private fun friendlyMessage(method: HttpMethod, message: String): String =
    when {
        method == HttpMethod.Patch && message.startsWith("JSON object requested") ->
            "User cannot update this resource"

        method == HttpMethod.Post && message.startsWith("new row violates row-level security") ->
            "User cannot create this resource"

        method == HttpMethod.Post && message.startsWith("duplicate key value") ->
            "Duplicate found, please try to update the existing resource instead"

        else -> message
    }

private fun JsonElement?.text(): String? = (this as? JsonPrimitive)?.contentOrNull?.takeIf { it.isNotEmpty() }
