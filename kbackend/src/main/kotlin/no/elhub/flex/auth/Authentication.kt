package no.elhub.flex.auth

import arrow.core.getOrElse
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationPlugin
import io.ktor.server.application.createApplicationPlugin
import io.ktor.server.application.hooks.CallSetup
import io.ktor.server.response.respond
import io.ktor.util.AttributeKey
import no.elhub.flex.controllableunit.ErrorMessage

private val logger = KotlinLogging.logger {}

/** Ktor [io.ktor.util.AttributeKey] for storing the verified [AccessToken] in call attributes. */
val AccessTokenKey = AttributeKey<AccessToken>("flex-access-token")

/** Configuration for the [FlexAuthentication] plugin. */
class FlexAuthenticationConfig {
    /** The HS256 secret used to verify incoming JWTs. */
    var jwtSecret: String = ""
}

/**
 * Ktor plugin that verifies the `Authorization: Bearer` JWT on every incoming request,
 * parses the claims into an [AccessToken], and stores it under [AccessTokenKey].
 *
 * Responds with HTTP 401 when the token is missing, invalid, or expired.
 */
val FlexAuthentication: ApplicationPlugin<FlexAuthenticationConfig> =
    createApplicationPlugin("FlexAuthentication", ::FlexAuthenticationConfig) {
        val secret = pluginConfig.jwtSecret

        on(CallSetup) { call ->
            val authHeader = call.request.headers["Authorization"]
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.debug { "Missing or malformed Authorization header" }
                call.respond(
                    HttpStatusCode.Unauthorized,
                    ErrorMessage(code = "HTTP401", message = MissingTokenError.message ?: "Unauthorized"),
                )
                return@on
            }

            val jwt = authHeader.removePrefix("Bearer ")

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
