package no.elhub.flex.api.routes.controllableunit

import io.ktor.server.application.Application
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import no.elhub.flex.auth.plugin.FlexRole
import no.elhub.flex.auth.plugin.authenticatedRouting
import no.elhub.flex.auth.plugin.requireRoles
import no.elhub.flex.auth.plugin.requireScope
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import org.koin.ktor.ext.inject

/** Registers all `controllable_unit` routes on [Application]. */
fun Application.controllableUnitRoutes() {
    authenticatedRouting {
        val lookup: ControllableUnitLookup by inject()
        route("/controllable_unit") {
            route("/lookup") {
                requireRoles(FlexRole.SERVICE_PROVIDER, FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR)
                requireScope(
                    Scope(ScopeVerb.Use, "data:controllable_unit:lookup")
                )
                post { lookup.handle(call) }
            }
        }
    }
}
