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
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.postgrest.PostgrestClient
import no.elhub.flex.api.postgrest.PostgrestRouteVariant
import no.elhub.flex.api.postgrest.RequestRejection
import no.elhub.flex.api.postgrest.buildPostgrestRequest
import no.elhub.flex.api.routes.data.generated.GeneratedDataApiRoutes
import no.elhub.flex.api.util.respondError
import no.elhub.flex.auth.plugin.accessToken
import no.elhub.flex.auth.plugin.authenticatedRouting
import no.elhub.flex.auth.plugin.respondInsufficientScope
import no.elhub.flex.auth.scope.covers
import org.koin.ktor.ext.inject

/**
 * Registers the data API routes that are served by PostgREST, as listed by the generated route table
 * and the [DataApiRegistry], and a JSON 404 for everything else.
 */
fun Application.dataApiRoutes() {
    val postgrest: PostgrestClient by inject()

    authenticatedRouting {
        for ((apiRoute, variant) in DataApiRegistry.servedByPostgrest(GeneratedDataApiRoutes.routes)) {
            route(apiRoute.path) {
                method(apiRoute.method) {
                    handle { handlePostgrestRoute(call, postgrest, variant) }
                }
            }
        }
    }

    // outside authenticatedRouting so that unknown routes get a 404 rather than a 401
    routing {
        route("{...}") {
            handle {
                call.respondError(
                    HttpStatusCode.NotFound,
                    ErrorMessage(code = "HTTP404", message = "Not Found: ${call.request.httpMethod.value} ${call.request.path()}"),
                )
            }
        }
    }
}

private suspend fun handlePostgrestRoute(call: ApplicationCall, postgrest: PostgrestClient, variant: PostgrestRouteVariant) {
    val method = call.request.httpMethod
    val path = call.request.path()
    variant.validate(call.request.queryParameters)?.let { return call.respondRejection(it) }

    val scopes = call.accessToken.scope
    val requiredScope = variant.requiredScope(method, path)
    if (!scopes.covers(requiredScope)) {
        return call.respondInsufficientScope(requiredScope)
    }

    val query = ParametersBuilder().apply { appendAll(call.request.queryParameters) }
    val (upstreamPath, headers) = variant.rewrite(path, query)

    buildPostgrestRequest(method, upstreamPath, query, scopes, headers).fold(
        ifLeft = { call.respondRejection(it) },
        ifRight = { request ->
            val body = if (method == HttpMethod.Post || method == HttpMethod.Patch) call.receive<ByteArray>() else null
            postgrest.forward(call, method, request, body)
        },
    )
}

private suspend fun ApplicationCall.respondRejection(rejection: RequestRejection) {
    rejection.wwwAuthenticate?.let { response.header(HttpHeaders.WWWAuthenticate, it) }
    respondError(
        rejection.status,
        ErrorMessage(code = "HTTP${rejection.status.value}", message = rejection.message, details = rejection.details),
    )
}
