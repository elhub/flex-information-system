package no.elhub.flex.auth.plugin

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.auth.AuthScheme
import io.ktor.http.auth.HeaderValueEncoding
import io.ktor.http.auth.HttpAuthHeader
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.header
import io.ktor.server.response.respond
import no.elhub.flex.auth.model.dto.generated.models.ErrorMessage
import no.elhub.flex.auth.scope.Scope

/**
 * Values of the `WWW-Authenticate` response header for bearer tokens, see
 * [RFC 6750 section 3](https://www.rfc-editor.org/rfc/rfc6750#section-3).
 */
object BearerChallenge {
    /** For requests without credentials: no error code is given. */
    const val MISSING_TOKEN = AuthScheme.Bearer

    /** For a request whose `Authorization` header is not a bearer one. */
    fun invalidRequest(description: String): String =
        render("error" to "invalid_request", "error_description" to description)

    /** For a token that is expired, malformed, or invalid for other reasons. */
    fun invalidToken(description: String): String =
        render("error" to "invalid_token", "error_description" to description)

    /** For a valid token that lacks the [required] scope. */
    fun insufficientScope(required: Scope): String =
        render("error" to "insufficient_scope", "scope" to required.toString())

    private fun render(vararg parameters: Pair<String, String>): String =
        HttpAuthHeader.Parameterized(AuthScheme.Bearer, parameters.toMap(), HeaderValueEncoding.QUOTED_ALWAYS).render()
}

/** Responds with HTTP 403 for a token that lacks the [required] scope, with a `WWW-Authenticate` challenge. */
suspend fun ApplicationCall.respondInsufficientScope(required: Scope) {
    response.header(HttpHeaders.WWWAuthenticate, BearerChallenge.insufficientScope(required))
    respond(
        HttpStatusCode.Forbidden,
        ErrorMessage(code = "HTTP403", message = "Forbidden", details = "insufficient scope"),
    )
}
