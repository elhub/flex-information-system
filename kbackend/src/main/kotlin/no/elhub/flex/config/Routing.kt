package no.elhub.flex.config

import io.ktor.server.application.Application
import no.elhub.flex.routes.controllableunit.controllableUnitRoutes

/** Defines the endpoints of the application. */
fun Application.configureRouting() {
    controllableUnitRoutes()
}
