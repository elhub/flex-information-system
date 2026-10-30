package no.elhub.flex.api.config

import io.ktor.server.application.Application
import no.elhub.flex.api.routes.attachment.attachmentRoutes
import no.elhub.flex.api.routes.controllableunit.controllableUnitRoutes

/** Defines the endpoints of the application. */
fun Application.configureRouting() {
    controllableUnitRoutes()
    attachmentRoutes()
}
