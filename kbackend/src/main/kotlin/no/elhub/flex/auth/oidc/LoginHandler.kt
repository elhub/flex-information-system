package no.elhub.flex.auth.oidc

import arrow.core.raise.either
import arrow.core.raise.ensure
import io.ktor.server.application.ApplicationCall
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.plugin.requireCallerScope
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.shared.http.AppError
import no.elhub.flex.shared.http.AuthError
import no.elhub.flex.shared.http.respondRedirect
import org.koin.core.annotation.Single

private val REQUIRED_SCOPE = Scope(ScopeVerb.Read, "auth:login")

/**
 * Starts the authorization code flow with the external identity provider.
 * It pushes an authorization request to the external identity provider before
 * redirecting the user to the external identity provider.
 */
@Single
class LoginHandler(
    private val config: AuthConfig,
    private val oidcProvider: OidcProvider,
) {

    suspend fun handle(call: ApplicationCall) {
        if (!call.requireCallerScope(REQUIRED_SCOPE)) return

        either {
            val returnUrl = call.request.queryParameters["return_url"]?.takeIf { it.isNotEmpty() }
                ?: "/#/login/assumeParty"
            ensure(returnUrl.startsWith("/#/")) {
                AuthError("return_url must be a relative path in the frontend")
            }

            val (url, authDetails) = oidcProvider.authUrl()

            val loginCookie = LoginCookie(authDetails, returnUrl).toCookie(config.jwtSecret)
            call.response.cookies.append(loginCookie)

            url
        }.respondRedirect(call, permanent = false)
    }
}
