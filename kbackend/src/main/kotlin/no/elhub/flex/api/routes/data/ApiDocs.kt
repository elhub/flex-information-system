package no.elhub.flex.api.routes.data

import io.ktor.http.ContentType
import io.ktor.server.application.Application
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject
import no.elhub.flex.api.config.DocsConfig
import org.koin.core.annotation.Single
import org.koin.ktor.ext.inject

/**
 * The path the data API is served under, as seen by its clients.
 *
 * It is used for the `servers` entry of the OpenAPI document. The routes themselves are still served
 * without it, since the Go backend strips it before forwarding. When the Go backend is removed,
 * the routes are mounted under this path.
 */
const val DATA_API_MOUNT_PATH = "/api/v1"

private const val TITLE = "Flex Data API"

/**
 * The interactive documentation of the data API: the OpenAPI document and an Elements page showing it.
 */
@Single(createdAtStart = true)
class ApiDocs(config: DocsConfig) {
    val page: String = resource("docs/elements.html").replace("__TITLE__", TITLE)

    /** The OpenAPI document with `servers` replaced by the public URL of the API. */
    val openApi: String = run {
        val serverUrl = config.baseUrl.trimEnd('/') + DATA_API_MOUNT_PATH + "/"
        val server = JsonObject(mapOf("url" to JsonPrimitive(serverUrl), "description" to JsonPrimitive(TITLE)))
        val document = Json.parseToJsonElement(resource("openapi/openapi.json")).jsonObject
        JsonObject(document + ("servers" to JsonArray(listOf(server)))).toString()
    }

    private fun resource(path: String): String =
        requireNotNull(ApiDocs::class.java.classLoader.getResourceAsStream(path)) { "missing resource $path" }
            .use { it.readBytes().decodeToString() }
}

/** Registers the documentation of the data API: `GET /` and `GET /openapi.json`. */
fun Application.apiDocsRoutes() {
    val docs: ApiDocs by inject()

    routing {
        get("/") { call.respondText(docs.page, ContentType.Text.Html) }
        get("/openapi.json") { call.respondText(docs.openApi, ContentType.Application.Json) }
    }
}
