package no.elhub.flex.auth.plugin

import arrow.core.getOrElse
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.AuthenticationConfig
import io.ktor.server.auth.AuthenticationContext
import io.ktor.server.auth.AuthenticationFailedCause
import io.ktor.server.auth.AuthenticationProvider
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.routing
import no.elhub.flex.auth.model.dto.generated.models.ErrorMessage
import no.elhub.flex.auth.model.dto.generated.models.OauthErrorMessage
import no.elhub.flex.auth.token.AccessToken
import no.elhub.flex.auth.token.MissingTokenError

private val logger = KotlinLogging.logger {}

/** Name of the session cookie carrying the JWT */
private const val SESSION_COOKIE_NAME = "__Host-flex_session"

private const val BEARER_PREFIX = "Bearer "

private const val MISSING_BEARER_DESCRIPTION = "missing Bearer in Authorization header"

/** Name under which the [FlexAuthenticationProvider] is registered, to be used with [authenticate]. */
const val FLEX_AUTH = "flex"

/** Configuration for the [FlexAuthenticationProvider]. */
class FlexAuthenticationConfig(name: String?) : AuthenticationProvider.Config(name) {
    /** The HS256 secret used to verify incoming JWTs. */
    var jwtSecret: String = ""
}

/**
 * Authentication provider that verifies the JWT of a request and exposes the parsed [AccessToken]
 * as the call's principal (see [accessToken]).
 *
 * Token resolution order:
 * 1. `Authorization: Bearer <token>` header — takes precedence. An empty header counts as absent.
 * 2. `__Host-flex_session` cookie — fallback for browser/OIDC sessions.
 *
 * Failures are answered with
 * - HTTP 401 and `WWW-Authenticate: Bearer` when there is no token at all,
 * - HTTP 401 and `WWW-Authenticate: Bearer error="invalid_token"` when the token is invalid or expired,
 * - HTTP 400 and an OAuth `invalid_request` body when the `Authorization` header is not a `Bearer` header
 *   (RFC 6750 section 3.1).
 */
class FlexAuthenticationProvider(config: FlexAuthenticationConfig) : AuthenticationProvider(config) {
    private val secret = config.jwtSecret

    override suspend fun onAuthenticate(context: AuthenticationContext) {
        val call = context.call
        val authHeader = call.request.headers[HttpHeaders.Authorization]?.takeIf { it.isNotEmpty() }
        val sessionCookie = call.request.cookies[SESSION_COOKIE_NAME]

        val jwt = when {
            authHeader != null -> {
                if (!authHeader.startsWith(BEARER_PREFIX)) {
                    logger.debug { "Authorization header is not a Bearer header" }
                    context.reject(NonBearerChallengeKey, AuthenticationFailedCause.InvalidCredentials) {
                        response.headers.append(
                            HttpHeaders.WWWAuthenticate,
                            """Bearer error="invalid_request", error_description="$MISSING_BEARER_DESCRIPTION"""",
                        )
                        respond(
                            HttpStatusCode.BadRequest,
                            OauthErrorMessage(error = "invalid_request", errorDescription = MISSING_BEARER_DESCRIPTION),
                        )
                    }
                    return
                }
                authHeader.removePrefix(BEARER_PREFIX)
            }

            sessionCookie != null -> sessionCookie

            else -> {
                logger.debug { "No Authorization header or session cookie present" }
                context.reject(NoTokenChallengeKey, AuthenticationFailedCause.NoCredentials) {
                    response.headers.append(HttpHeaders.WWWAuthenticate, "Bearer")
                    respond(
                        HttpStatusCode.Unauthorized,
                        ErrorMessage(code = "HTTP401", message = MissingTokenError.message),
                    )
                }
                return
            }
        }

        val token = AccessToken.parse(jwt, secret).getOrElse { error ->
            logger.debug { "JWT verification failed: ${error.message}" }
            context.reject(InvalidTokenChallengeKey, AuthenticationFailedCause.InvalidCredentials) {
                response.headers.append(
                    HttpHeaders.WWWAuthenticate,
                    """Bearer error="invalid_token", error_description="invalid bearer token"""",
                )
                respond(
                    HttpStatusCode.Unauthorized,
                    ErrorMessage(code = "HTTP401", message = "unable to verify and validate token"),
                )
            }
            return
        }

        context.principal(name, token)
    }
}

private object NonBearerChallengeKey

private object NoTokenChallengeKey

private object InvalidTokenChallengeKey

private fun AuthenticationContext.reject(
    key: Any,
    cause: AuthenticationFailedCause,
    respond: suspend ApplicationCall.() -> Unit,
) {
    challenge(key, cause) { challenge, call ->
        call.respond()
        challenge.complete()
    }
}

/** Registers the [FlexAuthenticationProvider] under [name]. */
fun AuthenticationConfig.flex(name: String = FLEX_AUTH, configure: FlexAuthenticationConfig.() -> Unit) {
    register(FlexAuthenticationProvider(FlexAuthenticationConfig(name).apply(configure)))
}

/** Installs the Ktor [Authentication] plugin with the [FlexAuthenticationProvider] verifying tokens with [secret]. */
fun Application.configureAuthentication(secret: String) {
    install(Authentication) {
        flex { jwtSecret = secret }
    }
}

/**
 * Registers routes that all require a valid token, so that no route can be exposed unauthenticated by mistake.
 * Routes that must be reachable without authentication belong in a separate `routing { }` block.
 */
fun Application.authenticatedRouting(build: Route.() -> Unit) {
    routing {
        authenticate(FLEX_AUTH) { build() }
    }
}

/**
 * Like [authenticatedRouting], but callers that present no token are let through, to be served as anonymous
 * (see [callerScopes]). Callers that present an invalid token are still rejected.
 */
fun Application.optionalAuthenticatedRouting(build: Route.() -> Unit) {
    routing {
        authenticate(FLEX_AUTH, optional = true) { build() }
    }
}

/**
 * The raw JWT of the request, resolved like [FlexAuthenticationProvider] does: the `Authorization: Bearer`
 * header takes precedence over the session cookie. `null` if the request has neither.
 *
 * Meant for forwarding a token that the provider has verified, e.g. to PostgREST.
 */
fun ApplicationCall.presentedJwt(): String? {
    val authHeader = request.headers[HttpHeaders.Authorization]?.takeIf { it.isNotEmpty() }
    return when {
        authHeader != null -> authHeader.takeIf { it.startsWith(BEARER_PREFIX) }?.removePrefix(BEARER_PREFIX)
        else -> request.cookies[SESSION_COOKIE_NAME]
    }
}

/** The verified [AccessToken] of the caller. Only available on routes declared with [authenticatedRouting]. */
val ApplicationCall.accessToken: AccessToken
    get() = checkNotNull(principal<AccessToken>()) {
        "No access token found: the route must be declared inside authenticatedRouting"
    }
