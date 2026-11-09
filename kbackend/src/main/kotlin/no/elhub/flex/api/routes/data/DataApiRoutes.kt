package no.elhub.flex.api.routes.data

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.http.ParametersBuilder
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.request.receive
import io.ktor.server.response.header
import io.ktor.server.routing.method
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.api.auth.callerScopes
import no.elhub.flex.api.auth.covers
import no.elhub.flex.api.auth.respondInsufficientScope
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.postgrest.EmbedRelations
import no.elhub.flex.api.postgrest.PostgrestClient
import no.elhub.flex.api.postgrest.PostgrestRouteVariant
import no.elhub.flex.api.postgrest.RequestRejection
import no.elhub.flex.api.postgrest.buildPostgrestRequest
import no.elhub.flex.api.routes.data.generated.GeneratedDataApiRoutes
import no.elhub.flex.api.util.respondError
import org.koin.ktor.ext.inject

const val DATA_API_MOUNT_PATH = "/api/v1"

/**
 * Registers the data API routes that are served by PostgREST, as listed by the generated route table
 * and the [DataApiRegistry], and a JSON 404 for everything else.
 */
fun Application.dataApiRoutes() {
    val postgrest: PostgrestClient by inject()

    routing {
        route(DATA_API_MOUNT_PATH) {
            for ((apiRoute, variant) in DataApiRegistry.servedByPostgrest(GeneratedDataApiRoutes.routes)) {
                route(apiRoute.path) {
                    method(apiRoute.method) {
                        handle { handlePostgrestRoute(call, postgrest, variant, mountPath = DATA_API_MOUNT_PATH) }
                    }
                }
            }

            route("{...}") {
                handle {
                    val path = call.request.path().removePrefix(DATA_API_MOUNT_PATH)
                    call.respondError(
                        HttpStatusCode.NotFound,
                        ErrorMessage(code = "HTTP404", message = "Not Found: ${call.request.httpMethod.value} $path"),
                    )
                }
            }
        }
    }
}

/**
 * Serves [call] through PostgREST, as decided by [variant]. The route is mounted under [mountPath], which is not part
 * of the path that is scoped and forwarded.
 */
internal suspend fun handlePostgrestRoute(
    call: ApplicationCall,
    postgrest: PostgrestClient,
    variant: PostgrestRouteVariant,
    mountPath: String = "",
    asset: String = "data",
    relations: EmbedRelations = GeneratedDataApiRoutes.embedRelations,
) {
    val method = call.request.httpMethod
    val path = call.request.path().removePrefix(mountPath)
    variant.validate(call.request.queryParameters)?.let { return call.respondRejection(it) }

    val scopes = call.callerScopes()
    val requiredScope = variant.requiredScope(method, path)
    if (!scopes.covers(requiredScope)) {
        return call.respondInsufficientScope(requiredScope)
    }

    val query = ParametersBuilder().apply { appendAll(call.request.queryParameters) }
    val (upstreamPath, headers) = variant.rewrite(path, query)

    buildPostgrestRequest(method, upstreamPath, query, scopes, headers, relations, asset).fold(
        ifLeft = { call.respondRejection(it) },
        ifRight = { request ->
            val body = if (method == HttpMethod.Post || method == HttpMethod.Patch) call.receive<ByteArray>() else null
            postgrest.forward(call, method, request, body)
        },
    )
}

internal suspend fun ApplicationCall.respondRejection(rejection: RequestRejection) {
    rejection.wwwAuthenticate?.let { response.header(HttpHeaders.WWWAuthenticate, it) }
    respondError(
        rejection.status,
        ErrorMessage(code = "HTTP${rejection.status.value}", message = rejection.message, details = rejection.details),
    )
}
