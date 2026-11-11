package no.elhub.flex.api.config

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationPlugin
import io.ktor.server.application.createApplicationPlugin
import io.ktor.server.application.hooks.CallSetup
import io.ktor.server.request.path
import io.ktor.server.response.header
import no.elhub.flex.api.model.dto.generated.models.ApiVersion
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.util.respondError

const val API_VERSION_HEADER = "Api-Version"

/**
 * Configuration of [RequireApiVersion]. The version is only checked for the paths under [pathPrefixes],
 * so at least one prefix must be added:
 *
 * ```
 * install(RequireApiVersion) {
 *     pathPrefixes += "/api/v1"
 *     exemptPaths += "/api/v1/openapi.json"
 *     exemptSuffixes += "/download"
 * }
 * ```
 */
class RequireApiVersionConfig {
    /**
     * The paths the version check applies to. A prefix covers the path itself and everything below it:
     * `/api/v1` covers `/api/v1` and `/api/v1/party`, but not `/api/v10` or `/grid/v0`.
     * Requests to any other path are not checked.
     */
    val pathPrefixes: MutableSet<String> = mutableSetOf()

    /**
     * Paths that need no version even though they are under one of the [pathPrefixes].
     * Matched against the whole path, so `/api/v1/openapi.json` exempts only that path.
     */
    val exemptPaths: MutableSet<String> = mutableSetOf()

    /**
     * Path endings that need no version even though the path is under one of the [pathPrefixes].
     * `/download` exempts every path that ends with `/download`.
     */
    val exemptSuffixes: MutableSet<String> = mutableSetOf()
}

/**
 * Requires an `Api-Version` header with a version known from the OpenAPI document for the paths under
 * [RequireApiVersionConfig.pathPrefixes], and echoes the latest version back in the response.
 * Responds with HTTP 400 otherwise. Paths outside the prefixes are left alone.
 *
 * Downloads are exempt since browsers navigate to them directly and cannot send custom headers.
 */
val RequireApiVersion: ApplicationPlugin<RequireApiVersionConfig> =
    createApplicationPlugin("RequireApiVersion", ::RequireApiVersionConfig) {
        val pathPrefixes = pluginConfig.pathPrefixes.toSet()
        val exemptPaths = pluginConfig.exemptPaths.toSet()
        val exemptSuffixes = pluginConfig.exemptSuffixes.toSet()
        val current = ApiVersion.entries.last().value

        on(CallSetup) { call ->
            val path = call.request.path()
            if (pathPrefixes.none { path == it || path.startsWith("$it/") }) return@on
            if (path in exemptPaths || exemptSuffixes.any { path.endsWith(it) }) return@on

            val requested = call.request.headers[API_VERSION_HEADER]
            if (requested == null || ApiVersion.fromValue(requested) == null) {
                call.respondError(
                    HttpStatusCode.BadRequest,
                    ErrorMessage(code = "HTTP400", message = "Api-Version header is required and must be a supported version"),
                )
                return@on
            }

            call.response.header(API_VERSION_HEADER, current)
        }
    }
