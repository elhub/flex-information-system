package no.elhub.flex.auth

import io.ktor.server.application.Application
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.auth.plugin.authenticatedRouting
import no.elhub.flex.auth.plugin.requireScope
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.session.SessionHandler
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

    // no auth plugin: the session endpoints reads the cookie itself
    routing {
        val session: SessionHandler by inject()
        get("/auth/v1/session") { session.handle(call) }
    }
}
