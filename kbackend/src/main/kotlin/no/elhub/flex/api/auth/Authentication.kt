package no.elhub.flex.api.auth

import arrow.core.getOrElse
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.auth.AuthScheme
import io.ktor.http.auth.HttpAuthHeader
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.ApplicationPlugin
import io.ktor.server.application.createApplicationPlugin
import io.ktor.server.application.hooks.CallSetup
import io.ktor.server.auth.parseAuthorizationHeader
import io.ktor.server.request.uri
import io.ktor.server.response.respond
import io.ktor.util.AttributeKey
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage

private val logger = KotlinLogging.logger {}

/** Name of the session cookie carrying the JWT */
private const val SESSION_COOKIE_NAME = "__Host-flex_session"

/** Ktor [io.ktor.util.AttributeKey] for storing the verified [AccessToken] in call attributes. */
val AccessTokenKey = AttributeKey<AccessToken>("flex-access-token")

/** Configuration for the [FlexAuthentication] plugin. */
class FlexAuthenticationConfig {
    /** The HS256 secret used to verify incoming JWTs. */
    var jwtSecret: String = ""

    /** Paths that bypass JWT verification entirely (exact match). */
    val excludedPaths: MutableList<String> = mutableListOf()
}

/**
 * Plugin that verifies incoming JWTs on every request and stores the parsed
 * [AccessToken] under [AccessTokenKey].
 *
 * Token resolution order (matching the Go backend):
 * 1. `Authorization: Bearer <token>` header — takes precedence.
 * 2. `__Host-flex_session` cookie — fallback for browser/OIDC sessions.
 *
 * Responds with HTTP 401 when the token is invalid or expired. A request without a token is let through;
 * routes that require authentication respond with HTTP 401 themselves.
 */
val FlexAuthentication: ApplicationPlugin<FlexAuthenticationConfig> =
    createApplicationPlugin("FlexAuthentication", ::FlexAuthenticationConfig) {
        val secret = pluginConfig.jwtSecret
        val excludedPaths = pluginConfig.excludedPaths.toSet()

        on(CallSetup) { call ->
            if (call.request.uri in excludedPaths) return@on

            // a missing token is not an error here: routes that need one reject the call themselves
            // (see RequireScope and RequireRole), others serve the caller as anonymous
            val jwt = call.presentedJwt()
            if (jwt == null) {
                logger.debug { "No Authorization header or session cookie present" }
                return@on
            }

            AccessToken.parse(jwt, secret).getOrElse { error ->
                logger.debug { "JWT verification failed: ${error.message}" }
                call.respondUnauthorized(BearerChallenge.invalidToken(error.message), error.message)
                return@on
            }.also { token ->
                call.attributes.put(AccessTokenKey, token)
            }
        }
    }

/**
 * The JWT of the request: the `Authorization: Bearer` header takes precedence over the session cookie.
 * `null` if the request has neither.
 */
fun ApplicationCall.presentedJwt(): String? {
    // a malformed header is treated like a missing one, so that the session cookie can still be used
    val header = runCatching { request.parseAuthorizationHeader() }.getOrNull()
    if (header is HttpAuthHeader.Single && header.authScheme.equals(AuthScheme.Bearer, ignoreCase = true)) {
        return header.blob
    }
    return request.cookies[SESSION_COOKIE_NAME]
}

/** Responds with HTTP 401 and returns `null` if the call carries no verified token; otherwise returns the token. */
suspend fun ApplicationCall.requireAccessToken(): AccessToken? {
    val token = attributes.getOrNull(AccessTokenKey)
    if (token == null) {
        respondUnauthorized(BearerChallenge.MISSING_TOKEN, MissingTokenError.message)
    }
    return token
}
