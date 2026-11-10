package no.elhub.flex.auth.oidc

import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respondRedirect
import no.elhub.flex.auth.plugin.requireCallerScope
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.session.unsetSessionCookie
import org.koin.core.annotation.Single

private val REQUIRED_SCOPE = Scope(ScopeVerb.Read, "auth:logout")

/** Unsets the session cookie and redirects to the end session URL of the identity provider. */
@Single
class LogoutHandler(private val oidcProvider: OidcProvider) {

    suspend fun handle(call: ApplicationCall) {
        if (!call.requireCallerScope(REQUIRED_SCOPE)) return

        call.unsetSessionCookie()
        call.respondRedirect(oidcProvider.endSessionUrl())
    }
}
