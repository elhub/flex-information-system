package no.elhub.flex.api

import io.ktor.server.application.Application
import no.elhub.flex.api.routes.attachment.attachmentRoutes
import no.elhub.flex.api.routes.controllableunit.controllableUnitRoutes
import no.elhub.flex.api.routes.data.apiDocsRoutes
import no.elhub.flex.api.routes.data.dataApiRoutes
import no.elhub.flex.api.routes.entity.entityRoutes
import no.elhub.flex.api.routes.grid.gridApiDocsRoutes
import no.elhub.flex.api.routes.grid.gridApiRoutes
import no.elhub.flex.api.routes.notFoundRoute

/** Registers the routes of the data API. */
fun Application.apiRoutes() {
    controllableUnitRoutes()
    attachmentRoutes()
    entityRoutes()
    apiDocsRoutes()
    dataApiRoutes()
    gridApiDocsRoutes()
    gridApiRoutes()
    notFoundRoute()
}
