package no.elhub.flex.api.routes.data

import io.ktor.http.ContentType
import io.ktor.server.application.Application
import io.ktor.server.response.respondRedirect
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject
import no.elhub.flex.api.config.DocsConfig
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

/** The Elements page showing the OpenAPI document next to it, with the given [title]. */
internal fun elementsPage(title: String): String = resource("docs/elements.html").replace("__TITLE__", title)

/** The OpenAPI document in [resource], with `servers` set to the public URL of the API mounted at [mountPath]. */
internal fun openApiDocument(resource: String, baseUrl: String, mountPath: String, title: String): String {
    val serverUrl = baseUrl.trimEnd('/') + mountPath + "/"
    val server = JsonObject(mapOf("url" to JsonPrimitive(serverUrl), "description" to JsonPrimitive(title)))
    val document = Json.parseToJsonElement(resource(resource)).jsonObject
    return JsonObject(document + ("servers" to JsonArray(listOf(server)))).toString()
}

private fun resource(path: String): String =
    requireNotNull(ApiDocs::class.java.classLoader.getResourceAsStream(path)) { "missing resource $path" }
        .use { it.readBytes().decodeToString() }

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
