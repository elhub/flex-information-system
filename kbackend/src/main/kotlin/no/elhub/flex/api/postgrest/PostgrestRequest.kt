package no.elhub.flex.api.postgrest

import arrow.core.Either
import arrow.core.raise.either
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.http.Parameters
import io.ktor.http.ParametersBuilder
import no.elhub.flex.api.auth.Scope
import no.elhub.flex.api.auth.ScopeVerb
import no.elhub.flex.api.routes.data.generated.GeneratedDataApiRoutes

/**
 * What to send to PostgREST: the [path], the [query] and the [headers] that replace
 * whatever headers the client sent under the same name.
 */
data class PostgrestRequest(
    val path: String,
    val query: Parameters,
    val headers: Map<String, String>,
)

/** An error that the API reports to the caller itself, as opposed to one reported by PostgREST. */
data class RequestRejection(
    val status: HttpStatusCode,
    val message: String,
    val details: String? = null,
    /** The `WWW-Authenticate` header to respond with, if any. */
    val wwwAuthenticate: String? = null,
)

private val singleIdPath = Regex("^/([a-z_]+)/([0-9]+)$")

private const val SINGLE_OBJECT_MEDIA_TYPE = "application/vnd.pgrst.object+json"
private const val DATA_ASSET = "data"

/**
 * The scope required for a request to [path] with [method]: `read` for `GET`, `manage` otherwise,
 * on the asset built from the path, e.g. `GET /foo/12` requires `read:data:foo:12`.
 */
fun defaultRequiredScope(method: HttpMethod, path: String, asset: String = DATA_ASSET): Scope {
    val verb = if (method == HttpMethod.Get) ScopeVerb.Read else ScopeVerb.Manage
    val parts = path.trim('/').split('/')
    return Scope(verb, (listOf(asset) + parts).joinToString(":"))
}

/**
 * Translates a data API request into a PostgREST request.
 *
 * - Objects are requested and returned for `POST` and `PATCH`, so that responses are single objects.
 * - `/<resource>/<id>` becomes `/<resource>?id=eq.<id>`, requesting a single object.
 * - `?embed` becomes `?select`, after checking that [scopes] cover reading the embedded resources.
 * - `valid_at` and `as_of` become filters on their respective columns.
 *
 * The scopes for embedded resources are checked under [asset], against [relations].
 * The [query] is modified in-place.
 */
fun buildPostgrestRequest(
    method: HttpMethod,
    path: String,
    query: ParametersBuilder,
    scopes: List<Scope>,
    extraHeaders: Map<String, String> = emptyMap(),
    relations: EmbedRelations = GeneratedDataApiRoutes.embedRelations,
    asset: String = DATA_ASSET,
): Either<RequestRejection, PostgrestRequest> = either {
    val headers = linkedMapOf<String, String>()
    var postgrestPath = path

    if (method == HttpMethod.Post || method == HttpMethod.Patch) {
        headers[HttpHeaders.Accept] = SINGLE_OBJECT_MEDIA_TYPE
        headers["Prefer"] = "return=representation"
    }

    singleIdPath.matchEntire(path)?.let { match ->
        postgrestPath = "/" + match.groupValues[1]
        query["id"] = "eq." + match.groupValues[2]
        headers[HttpHeaders.Accept] = SINGLE_OBJECT_MEDIA_TYPE
    }

    applyEmbed(query, mainResource(postgrestPath), asset, relations, scopes)
    rewriteValidAt(query)
    rewriteAsOf(query)

    headers.putAll(extraHeaders)
    PostgrestRequest(postgrestPath, query.build(), headers)
}

/** The resource a PostgREST path is about; the event RPCs are embedded from `event`, the distance RPC from `substation`. */
private fun mainResource(path: String): String {
    val resource = path.trimStart('/').substringBefore('/')
    return when {
        path.startsWith("/rpc/event_") -> "event"
        path == "/rpc/substation_distance" -> "substation"
        else -> resource
    }
}
