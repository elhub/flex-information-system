package no.elhub.flex.controllableunit

import io.ktor.server.application.Application
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.controllableunit.lookup.ControllableUnitLookup
import org.koin.ktor.ext.inject

/** Registers all `controllable_unit` routes on [Application]. */
fun Application.controllableUnitRoutes() {
    routing {
        val lookup: ControllableUnitLookup by inject()
        route("/controllable_unit") {
            post("/lookup") {
                lookup.handle(call)
            }
        }
    }
}
