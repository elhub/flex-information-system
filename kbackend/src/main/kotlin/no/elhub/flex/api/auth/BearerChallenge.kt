package no.elhub.flex.api.auth

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.header
import io.ktor.server.response.respond
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage

/**
 * Values of the `WWW-Authenticate` response header for bearer tokens, see
 * [RFC 6750 section 3](https://www.rfc-editor.org/rfc/rfc6750#section-3).
 */
object BearerChallenge {
    /** For requests without credentials: no error code is given. */
    const val MISSING_TOKEN = "Bearer"

    /** For a token that is expired, malformed, or invalid for other reasons. */
    fun invalidToken(description: String): String =
        """Bearer error="invalid_token", error_description="${quotable(description)}""""

    /** For a valid token that lacks the [required] scope. */
    fun insufficientScope(required: Scope): String =
        """Bearer error="insufficient_scope", scope="${quotable(required.toString())}""""

    /** Makes [text] safe inside a quoted string: no quotes, backslashes or control characters. */
    private fun quotable(text: String): String =
        text.map { if (it == '"' || it == '\\') '\'' else it }
            .filter { it in ' '..'~' }
            .joinToString("")
}

/** Responds with HTTP 401 and the given `WWW-Authenticate` [challenge]. */
suspend fun ApplicationCall.respondUnauthorized(challenge: String, message: String) {
    response.header(HttpHeaders.WWWAuthenticate, challenge)
    respond(HttpStatusCode.Unauthorized, ErrorMessage(code = "HTTP401", message = message))
}

/** Responds with HTTP 403 for a token that lacks the [required] scope, with a `WWW-Authenticate` challenge. */
suspend fun ApplicationCall.respondInsufficientScope(required: Scope) {
    response.header(HttpHeaders.WWWAuthenticate, BearerChallenge.insufficientScope(required))
    respond(
        HttpStatusCode.Forbidden,
        ErrorMessage(code = "HTTP403", message = "Forbidden", details = "insufficient scope"),
    )
}
