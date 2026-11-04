package no.elhub.flex.api

import io.ktor.server.application.Application
import no.elhub.flex.api.routes.attachment.attachmentRoutes
import no.elhub.flex.api.routes.controllableunit.controllableUnitRoutes

/** Registers the routes of the data API. */
fun Application.apiRoutes() {
    controllableUnitRoutes()
    attachmentRoutes()
}
