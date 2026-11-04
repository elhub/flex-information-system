package no.elhub.flex.auth.plugin

import arrow.core.getOrElse
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.ApplicationPlugin
import io.ktor.server.application.createApplicationPlugin
import io.ktor.server.application.hooks.CallSetup
import io.ktor.server.request.uri
import io.ktor.server.response.respond
import io.ktor.util.AttributeKey
import no.elhub.flex.auth.model.dto.generated.models.ErrorMessage
import no.elhub.flex.auth.model.dto.generated.models.OauthErrorMessage
import no.elhub.flex.auth.token.AccessToken
import no.elhub.flex.auth.token.MissingTokenError

private val logger = KotlinLogging.logger {}

/** Name of the session cookie carrying the JWT */
private const val SESSION_COOKIE_NAME = "__Host-flex_session"

private const val BEARER_PREFIX = "Bearer "

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
 * Token resolution order:
 * 1. `Authorization: Bearer <token>` header — takes precedence. An empty header counts as absent.
 * 2. `__Host-flex_session` cookie — fallback for browser/OIDC sessions.
 *
 * Responds with
 * - HTTP 401 and `WWW-Authenticate: Bearer` when there is no token at all,
 * - HTTP 400 and an OAuth error body when the `Authorization` header is not a `Bearer` header,
 *   or when the token is invalid or expired.
 */
val FlexAuthentication: ApplicationPlugin<FlexAuthenticationConfig> =
    createApplicationPlugin("FlexAuthentication", ::FlexAuthenticationConfig) {
        val secret = pluginConfig.jwtSecret
        val excludedPaths = pluginConfig.excludedPaths.toSet()

        on(CallSetup) { call ->
            if (call.request.uri in excludedPaths) return@on

            val authHeader = call.request.headers[HttpHeaders.Authorization]?.takeIf { it.isNotEmpty() }
            val sessionCookie = call.request.cookies[SESSION_COOKIE_NAME]

            val jwt = when {
                authHeader != null -> {
                    if (!authHeader.startsWith(BEARER_PREFIX)) {
                        logger.debug { "Authorization header is not a Bearer header" }
                        call.respondBadToken(
                            challenge = """Bearer error="invalid_request", error_description="$MISSING_BEARER_DESCRIPTION"""",
                            description = MISSING_BEARER_DESCRIPTION,
                        )
                        return@on
                    }
                    authHeader.removePrefix(BEARER_PREFIX)
                }

                sessionCookie != null -> sessionCookie

                else -> {
                    logger.debug { "No Authorization header or session cookie present" }
                    call.response.headers.append(HttpHeaders.WWWAuthenticate, "Bearer")
                    call.respond(
                        HttpStatusCode.Unauthorized,
                        ErrorMessage(code = "HTTP401", message = MissingTokenError.message),
                    )
                    return@on
                }
            }

            AccessToken.parse(jwt, secret).getOrElse { error ->
                logger.debug { "JWT verification failed: ${error.message}" }
                call.respondBadToken(
                    challenge = """Bearer error="invalid_token", error_description="invalid bearer token"""",
                    description = "unable to verify and validate token",
                )
                return@on
            }.also { token ->
                call.attributes.put(AccessTokenKey, token)
            }
        }
    }

private const val MISSING_BEARER_DESCRIPTION = "missing Bearer in Authorization header"

/** Responds with HTTP 400, the `WWW-Authenticate` [challenge] and an OAuth `invalid_request` body. */
private suspend fun ApplicationCall.respondBadToken(challenge: String, description: String) {
    response.headers.append(HttpHeaders.WWWAuthenticate, challenge)
    respond(
        HttpStatusCode.BadRequest,
        OauthErrorMessage(error = "invalid_request", errorDescription = description),
    )
}
