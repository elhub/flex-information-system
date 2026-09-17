package no.elhub.flex.config

import io.ktor.server.application.Application
import no.elhub.flex.routes.attachment.attachmentRoutes
import no.elhub.flex.routes.controllableunit.controllableUnitRoutes
import no.elhub.flex.routes.serviceprovidinggroup.serviceProvidingGroupRoutes

/** Defines the endpoints of the application. */
fun Application.configureRouting() {
    controllableUnitRoutes()
    serviceProvidingGroupRoutes()
    attachmentRoutes()
}
