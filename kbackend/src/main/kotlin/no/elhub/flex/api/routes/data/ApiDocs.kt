package no.elhub.flex.api.routes.data

import io.ktor.http.ContentType
import io.ktor.server.application.Application
import io.ktor.server.response.respondRedirect
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.api.config.DocsConfig
import no.elhub.flex.api.routes.elementsPage
import no.elhub.flex.api.routes.openApiDocument
import org.koin.core.annotation.Single
import org.koin.ktor.ext.inject

private const val TITLE = "Flex Data API"

/**
 * The interactive documentation of the data API: the OpenAPI document and an Elements page showing it.
 */
@Single(createdAtStart = true)
class ApiDocs(config: DocsConfig) {
    val page: String = elementsPage(TITLE)

    /** The OpenAPI document with `servers` replaced by the public URL of the API. */
    val openApi: String = openApiDocument("openapi/data/openapi.json", config.baseUrl, DATA_API_MOUNT_PATH, TITLE)
}

/** Registers the documentation of the data API: `GET /api/v1/` and `GET /api/v1/openapi.json`. */
fun Application.apiDocsRoutes() {
    val docs: ApiDocs by inject()

    routing {
        route(DATA_API_MOUNT_PATH) {
            // the page loads the OpenAPI document by a relative URL, so it needs the trailing slash
            get { call.respondRedirect("$DATA_API_MOUNT_PATH/", permanent = true) }
            get("/") { call.respondText(docs.page, ContentType.Text.Html) }
            get("/openapi.json") { call.respondText(docs.openApi, ContentType.Application.Json) }
        }
    }
}
