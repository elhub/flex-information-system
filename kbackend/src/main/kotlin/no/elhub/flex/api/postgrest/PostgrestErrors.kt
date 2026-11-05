package no.elhub.flex.api.postgrest

import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage

private val json = Json { ignoreUnknownKeys = true }

/**
 * Turns an error response from PostgREST into our [ErrorMessage].
 *
 * Bodies that are not in PostgREST's error format get a generic message, and messages that would
 * reveal too much about PostgREST are replaced by more informative ones.
 */
fun rewritePostgrestError(method: HttpMethod, status: HttpStatusCode, body: String): ErrorMessage {
    val parsed = runCatching { json.parseToJsonElement(body) as? JsonObject }.getOrNull()
    fun field(name: String) = (parsed?.get(name) as? JsonPrimitive)?.contentOrNull

    val code = field("code")
    var message = field("message").orEmpty()
    var details = field("details")
    var hint = field("hint")

    if (code.isNullOrEmpty()) {
        message = "${status.value} ${status.description}"
        details = null
        hint = null
    }

    when (method) {
        HttpMethod.Patch -> if (message.startsWith("JSON object requested")) {
            message = "User cannot update this resource"
        }

        HttpMethod.Post -> when {
            message.startsWith("new row violates row-level security") -> message = "User cannot create this resource"

            message.startsWith("duplicate key value") ->
                message = "Duplicate found, please try to update the existing resource instead"
        }
    }

    return ErrorMessage(
        code = code.takeUnless { it.isNullOrEmpty() } ?: "HTTP${status.value}",
        message = message,
        details = details?.takeIf { it.isNotEmpty() },
        hint = hint?.takeIf { it.isNotEmpty() },
    )
}
