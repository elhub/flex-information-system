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

/** Configuration of [RequireApiVersion]. */
class RequireApiVersionConfig {
    /** Paths that need no version (exact match). */
    val exemptPaths: MutableSet<String> = mutableSetOf()

    /** Path prefixes that need no version. */
    val exemptPrefixes: MutableSet<String> = mutableSetOf()

    /** Path suffixes that need no version. */
    val exemptSuffixes: MutableSet<String> = mutableSetOf()
}

/**
 * Requires an `Api-Version` header with a version known from the OpenAPI document, and echoes the latest
 * version back in the response. Responds with HTTP 400 otherwise.
 *
 * Downloads are exempt since browsers navigate to them directly and cannot send custom headers.
 */
val RequireApiVersion: ApplicationPlugin<RequireApiVersionConfig> =
    createApplicationPlugin("RequireApiVersion", ::RequireApiVersionConfig) {
        val exemptPaths = pluginConfig.exemptPaths.toSet()
        val exemptPrefixes = pluginConfig.exemptPrefixes.toSet()
        val exemptSuffixes = pluginConfig.exemptSuffixes.toSet()
        val current = ApiVersion.entries.last().value

        on(CallSetup) { call ->
            val path = call.request.path()
            if (path in exemptPaths || exemptPrefixes.any { path.startsWith(it) } || exemptSuffixes.any { path.endsWith(it) }) return@on

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
