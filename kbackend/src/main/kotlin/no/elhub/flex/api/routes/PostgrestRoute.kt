package no.elhub.flex.api.routes

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.ParametersBuilder
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.request.receive
import io.ktor.server.response.header
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.postgrest.EmbedRelations
import no.elhub.flex.api.postgrest.PostgrestClient
import no.elhub.flex.api.postgrest.PostgrestRouteVariant
import no.elhub.flex.api.postgrest.RequestRejection
import no.elhub.flex.api.postgrest.buildPostgrestRequest
import no.elhub.flex.api.util.respondError
import no.elhub.flex.auth.plugin.callerScopes
import no.elhub.flex.auth.plugin.respondInsufficientScope
import no.elhub.flex.auth.scope.covers

/**
 * Serves [call] through PostgREST, as decided by [variant]. The route is mounted under [mountPath], which is not part
 * of the path that is scoped and forwarded.
 */
suspend fun handlePostgrestRoute(
    call: ApplicationCall,
    postgrest: PostgrestClient,
    variant: PostgrestRouteVariant,
    mountPath: String,
    asset: String,
    relations: EmbedRelations,
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

suspend fun ApplicationCall.respondRejection(rejection: RequestRejection) {
    rejection.wwwAuthenticate?.let { response.header(HttpHeaders.WWWAuthenticate, it) }
    respondError(
        rejection.status,
        ErrorMessage(code = "HTTP${rejection.status.value}", message = rejection.message, details = rejection.details),
    )
}
