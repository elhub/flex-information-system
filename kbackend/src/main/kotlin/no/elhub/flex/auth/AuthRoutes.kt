package no.elhub.flex.auth

import io.ktor.server.application.Application
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.auth.assume.AssumeHandler
import no.elhub.flex.auth.assume.UnassumeHandler
import no.elhub.flex.auth.oidc.CallbackHandler
import no.elhub.flex.auth.oidc.LoginHandler
import no.elhub.flex.auth.oidc.LogoutHandler
import no.elhub.flex.auth.plugin.authenticatedRouting
import no.elhub.flex.auth.plugin.optionalAuthenticatedRouting
import no.elhub.flex.auth.plugin.requireScope
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.session.SessionHandler
import no.elhub.flex.auth.token.TokenHandler
import no.elhub.flex.auth.userinfo.UserInfoHandler
import org.koin.ktor.ext.inject

/** Registers the routes of the auth API (`/auth/v1`) on [Application]. */
fun Application.authRoutes() {
    authenticatedRouting {
        val userInfo: UserInfoHandler by inject()
        route("/auth/v1") {
            route("/userinfo") {
                requireScope(Scope(ScopeVerb.Read, "auth:userinfo"))
                get { userInfo.handle(call) }
            }
        }
    }

    // TODO: consider removing token/scope check for these endpoints?
    //       callers come there without token and are let through as anonymous / default scopes
    //       this is just here to copy the previously existing behaviour in Go
    optionalAuthenticatedRouting {
        val login: LoginHandler by inject()
        val callback: CallbackHandler by inject()
        val logout: LogoutHandler by inject()
        route("/auth/v1") {
            get("/login") { login.handle(call) }
            get("/callback") { callback.handle(call) }
            get("/logout") { logout.handle(call) }
        }
    }

    // no auth plugin: these endpoints read the token themselves
    routing {
        val session: SessionHandler by inject()
        val token: TokenHandler by inject()
        val assume: AssumeHandler by inject()
        val unassume: UnassumeHandler by inject()
        get("/auth/v1/session") { session.handle(call) }
        post("/auth/v1/token") { token.handle(call) }
        post("/auth/v1/assume") { assume.handle(call) }
        delete("/auth/v1/assume") { unassume.handle(call) }
    }
}
