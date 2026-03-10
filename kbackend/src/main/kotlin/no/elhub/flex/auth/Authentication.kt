package no.elhub.flex.auth

import arrow.core.getOrElse
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationPlugin
import io.ktor.server.application.createApplicationPlugin
import io.ktor.server.application.hooks.CallSetup
import io.ktor.server.response.respond
import io.ktor.util.AttributeKey
import no.elhub.flex.controllableunit.dto.ErrorMessage

private val logger = KotlinLogging.logger {}

/** Name of the session cookie carrying the JWT */
private const val SESSION_COOKIE_NAME = "__Host-flex_session"

/** Ktor [io.ktor.util.AttributeKey] for storing the verified [AccessToken] in call attributes. */
val AccessTokenKey = AttributeKey<AccessToken>("flex-access-token")

/** Configuration for the [FlexAuthentication] plugin. */
class FlexAuthenticationConfig {
    /** The HS256 secret used to verify incoming JWTs. */
    var jwtSecret: String = ""
}

/**
 * Plugin that verifies incoming JWTs on every request and stores the parsed
 * [AccessToken] under [AccessTokenKey].
 *
 * Token resolution order (matching the Go backend):
 * 1. `Authorization: Bearer <token>` header — takes precedence.
 * 2. `__Host-flex_session` cookie — fallback for browser/OIDC sessions.
 *
 * Responds with HTTP 401 when no token is present, or when the token is invalid or expired.
 */
val FlexAuthentication: ApplicationPlugin<FlexAuthenticationConfig> =
    createApplicationPlugin("FlexAuthentication", ::FlexAuthenticationConfig) {
        val secret = pluginConfig.jwtSecret

        on(CallSetup) { call ->
            val authHeader = call.request.headers["Authorization"]

            val jwt = when {
                authHeader != null && authHeader.startsWith("Bearer ") -> authHeader.removePrefix("Bearer ")
                else -> call.request.cookies[SESSION_COOKIE_NAME]
            }

            if (jwt == null) {
                logger.debug { "No Authorization header or session cookie present" }
                call.respond(
                    HttpStatusCode.Unauthorized,
                    ErrorMessage(code = "HTTP401", message = MissingTokenError.message ?: "Unauthorized"),
                )
                return@on
            }

            AccessToken.parse(jwt, secret).getOrElse { error ->
                logger.debug { "JWT verification failed: ${error.message}" }
                call.respond(
                    HttpStatusCode.Unauthorized,
                    ErrorMessage(code = "HTTP401", message = error.message ?: "Unauthorized"),
                )
                return@on
            }.also { token ->
                call.attributes.put(AccessTokenKey, token)
            }
        }
    }
