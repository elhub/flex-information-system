package no.elhub.flex.auth.oidc

import arrow.core.raise.either
import arrow.core.raise.ensure
import com.auth0.jwt.interfaces.DecodedJWT
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.db.AuthRepository
import no.elhub.flex.auth.plugin.requireCallerScope
import no.elhub.flex.auth.scope.DefaultEntityScopes
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.session.setSessionCookie
import no.elhub.flex.auth.token.AccessToken
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.http.AuthError
import no.elhub.flex.shared.http.OAuthError
import no.elhub.flex.shared.http.respondRedirect
import org.koin.core.annotation.Single

private val logger = KotlinLogging.logger {}

private val REQUIRED_SCOPE = Scope(ScopeVerb.Read, "auth:callback")

private const val MILLIS_PER_SECOND = 1000L

/**
 * Handles the callback from the external identity provider.
 * It exchanges the authorization code for an access token and sets the session cookie.
 */
@Single
class CallbackHandler(
    private val config: AuthConfig,
    private val oidcProvider: OidcProvider,
    private val repository: AuthRepository,
) {

    suspend fun handle(call: ApplicationCall) {
        if (!call.requireCallerScope(REQUIRED_SCOPE)) return

        either {
            val code = call.request.queryParameters["code"]?.takeIf { it.isNotEmpty() }
                ?: raise(AuthError("no code in callback"))

            val returnedState = call.request.queryParameters["state"]?.takeIf { it.isNotEmpty() }
                ?: raise(AuthError("no state in callback"))

            val issuer = call.request.queryParameters["iss"]
            if (!issuer.isNullOrEmpty()) {
                // Not all IDPs send the issuer in the callback, so we ignore it if it is not
                // present. We will check the issuer in the id_token later. If the issuer is
                // present, it must match the issuer of the IDP.
                ensure(issuer == oidcProvider.issuer) { AuthError("invalid issuer in callback") }
            }

            val loginCookieStr = call.request.cookies[LOGIN_COOKIE_NAME]
                ?: raise(AuthError("missing login cookie"))
            val loginCookie = LoginCookie.parse(loginCookieStr, config.jwtSecret)
                .mapLeft { it.toAuthError() }
                .bind()

            oidcProvider.verify(loginCookie.authorizationDetails.stateVerifier, returnedState)
                .mapLeft { it.toAuthError("state") }
                .bind()

            val tokenResponse = oidcProvider.exchange(code, loginCookie.authorizationDetails.codeVerifier)
                .mapLeft { it.toAuthError() }
                .bind()
            val idToken = tokenResponse.idToken ?: raise(AuthError("no id_token in token response"))
            val token = oidcProvider.verifyIdToken(idToken)
                .mapLeft { it.toAuthError() }
                .bind()

            val returnedNonce = token.getClaim("nonce").asString()
                ?: raise(AuthError("no nonce in id_token"))
            oidcProvider.verify(loginCookie.authorizationDetails.nonceVerifier, returnedNonce)
                .mapLeft { it.toAuthError("nonce") }
                .bind()

            val (id, idType, name) = getUserData(token)

            val (entityId, eid) =
                with(FlexPrincipal.anonymous) {
                    repository.getOrCreateEntity(id, idType, name)
                }
                    .mapLeft { e ->
                        logger.debug { "getting identity of person identifier failed: ${e.message}" }
                        OAuthError("invalid_client", "you are not a registered user")
                    }
                    .bind()

            val accessToken = AccessToken(
                entityId = entityId.toInt(),
                externalId = eid,
                partyId = 0,
                role = "flex_entity",
                scope = DefaultEntityScopes,
                expiryUnixSeconds = System.currentTimeMillis() / MILLIS_PER_SECOND + AccessToken.DURATION_SECONDS,
            )

            call.setSessionCookie(accessToken.sign(config.jwtSecret), AccessToken.DURATION_SECONDS.toInt())
            call.response.cookies.append(LoginCookie.unset())

            loginCookie.returnUrl
        }.respondRedirect(call, permanent = false)
    }
}

private fun LoginCookieError.toAuthError() =
    when (this) {
        is InvalidLoginCookieError -> AuthError("invalid cookie", message)
        is MalformedLoginCookieError -> AuthError("malformed cookie", message, HttpStatusCode.InternalServerError)
    }

private fun VerificationError.toAuthError(what: String) =
    when (this) {
        is MalformedMessageError -> AuthError("malformed $what in callback", message, HttpStatusCode.InternalServerError)
        is HashMismatchError -> AuthError("invalid $what in callback", null, HttpStatusCode.InternalServerError)
    }

private fun TokenExchangeError.toAuthError() =
    AuthError("error in code exchange", message, HttpStatusCode.InternalServerError)

private fun IdTokenError.toAuthError() =
    when (this) {
        is InvalidIdTokenError -> AuthError("invalid id_token", message)
        is KeySetError -> AuthError("could not get key set", message, HttpStatusCode.InternalServerError)
    }

private data class UserData(val id: String, val idType: String, val name: String)

/**
 * Returns the identifier, type, and name from the token.
 * This is just a convenience method since different OIDC providers have different claims for the identifier.
 */
private fun getUserData(token: DecodedJWT): UserData {
    // IDPorten uses the `pid` claim, and since we request the `profile` scope,
    // we also get `given_name` and `family_name`.
    // cf https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_id_token.html
    token.getClaim("pid").asString()?.let { pid ->
        val name =
            listOfNotNull(
                token.getClaim("given_name").asString(),
                token.getClaim("family_name").asString(),
            )
                .joinToString(" ")
                .trim()
                .ifEmpty { pid }
        return UserData(pid, "pid", name)
    }

    // Entra and Authelia use the `preferred_username` claim, with `name`
    // available when the `profile` scope is requested.
    // cf https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference
    // Fall back to the `sub` claim for other providers.
    var id = token.getClaim("preferred_username").asString() ?: token.subject.orEmpty()

    var idType = "pid"
    if (id.contains("@")) {
        idType = "email"
        id = id.lowercase()
    }

    val name = token.getClaim("name").asString()?.takeIf { it.isNotEmpty() } ?: id

    return UserData(id, idType, name)
}
