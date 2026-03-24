package no.elhub.flex.routes.controllableunit

import io.ktor.server.application.Application
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.auth.FlexRole
import no.elhub.flex.auth.requireRoles
import org.koin.ktor.ext.inject

/** Registers all `controllable_unit` routes on [Application]. */
fun Application.controllableUnitRoutes() {
    routing {
        val lookup: ControllableUnitLookup by inject()
        route("/controllable_unit") {
            route("/lookup") {
                requireRoles(FlexRole.SERVICE_PROVIDER, FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR)
                post { lookup.handle(call) }
            }
        }
    }
}
