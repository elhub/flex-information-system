package no.elhub.flex

import io.ktor.server.application.Application
import no.elhub.flex.api.apiRoutes
import no.elhub.flex.auth.authRoutes

/** Defines the endpoints of the application, by registering the routes of each package. */
fun Application.configureRouting() {
    apiRoutes()
    authRoutes()
}
