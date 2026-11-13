package no.elhub.flex.auth.plugin

import arrow.core.getOrElse
import arrow.core.raise.Raise
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.header
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.covers
import no.elhub.flex.auth.token.AccessToken
import no.elhub.flex.shared.http.AppError
import no.elhub.flex.shared.http.AuthError
import no.elhub.flex.shared.http.OAuthError

private const val BEARER_PREFIX = "Bearer "

/**
 * The token of the caller of an endpoint that does not use the authentication plugin: the one of
 * the `Authorization: Bearer` header, which takes precedence, or of the session cookie.
 * `null` for an anonymous caller.
 *
 * The plugin answers 401 to an invalid token, where the OAuth endpoints answer 400, so these
 * endpoints read the token themselves. Raises HTTP 400 if the token is not valid.
 */
fun Raise<AppError>.callerToken(call: ApplicationCall, secret: String): AccessToken? {
    val authHeader = call.request.headers[HttpHeaders.Authorization]?.takeIf { it.isNotEmpty() }
    val jwt =
        if (authHeader != null) {
            if (!authHeader.startsWith(BEARER_PREFIX)) {
                val description = "missing Bearer in Authorization header"
                call.response.header(HttpHeaders.WWWAuthenticate, BearerChallenge.invalidRequest(description))
                raise(OAuthError("invalid_request", description))
            }
            authHeader.removePrefix(BEARER_PREFIX)
        } else {
            call.request.cookies[SESSION_COOKIE_NAME]
        } ?: return null

    return AccessToken.parse(jwt, secret).getOrElse {
        call.response.header(HttpHeaders.WWWAuthenticate, BearerChallenge.invalidToken("invalid bearer token"))
        raise(OAuthError("invalid_request", "unable to verify and validate token"))
    }
}

/** Raises HTTP 403 unless the [caller], or an anonymous one if `null`, has the [required] scope. */
fun Raise<AppError>.ensureCallerScope(call: ApplicationCall, caller: AccessToken?, required: Scope) {
    if (!(caller?.scope ?: AnonymousScopes).covers(required)) {
        call.response.header(HttpHeaders.WWWAuthenticate, BearerChallenge.insufficientScope(required))
        raise(AuthError("insufficient scope", code = HttpStatusCode.Forbidden))
    }
}
