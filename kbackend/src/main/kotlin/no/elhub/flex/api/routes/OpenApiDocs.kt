package no.elhub.flex.api.routes

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject

/** The Elements page showing the OpenAPI document next to it, with the given [title]. */
fun elementsPage(title: String): String = resource("docs/elements.html").replace("__TITLE__", title)

/** The OpenAPI document in [resource], with `servers` set to the public URL of the API mounted at [mountPath]. */
fun openApiDocument(resource: String, baseUrl: String, mountPath: String, title: String): String {
    val serverUrl = baseUrl.trimEnd('/') + mountPath + "/"
    val server = JsonObject(mapOf("url" to JsonPrimitive(serverUrl), "description" to JsonPrimitive(title)))
    val document = Json.parseToJsonElement(resource(resource)).jsonObject
    return JsonObject(document + ("servers" to JsonArray(listOf(server)))).toString()
}

private fun resource(path: String): String =
    requireNotNull(OpenApiResources::class.java.classLoader.getResourceAsStream(path)) { "missing resource $path" }
        .use { it.readBytes().decodeToString() }

private object OpenApiResources
