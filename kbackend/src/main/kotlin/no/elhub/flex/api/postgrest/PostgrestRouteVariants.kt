package no.elhub.flex.api.postgrest

import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.http.Parameters
import io.ktor.http.ParametersBuilder
import no.elhub.flex.api.auth.Scope
import no.elhub.flex.api.auth.ScopeVerb

/** Where in PostgREST a request goes: the [path], and the [headers] to set on it. */
data class UpstreamTarget(val path: String, val headers: Map<String, String> = emptyMap())

/**
 * How a route served by PostgREST deviates from the generic pipeline in [buildPostgrestRequest].
 */
interface PostgrestRouteVariant {
    /** Checks that run before the scope check. */
    fun validate(query: Parameters): RequestRejection? = null

    /** The scope the caller must have. */
    fun requiredScope(method: HttpMethod, path: String): Scope = defaultRequiredScope(method, path)

    /** Rewrites [query] in-place; returns where in PostgREST the request goes. */
    fun rewrite(path: String, query: ParametersBuilder): UpstreamTarget = UpstreamTarget(path)
}

/** The generic pipeline, with no deviations. */
object DefaultVariant : PostgrestRouteVariant

private val eventResource = Regex("""^eq\./([a-z_]+)/([0-9]+)$""")

/**
 * `GET /event`: `source=eq./<resource>/<id>` and `subject=eq./<resource>/<id>` filter through the
 * `event_source` and `event_subject` functions instead of the table.
 */
object EventListVariant : PostgrestRouteVariant {
    override fun rewrite(path: String, query: ParametersBuilder): UpstreamTarget {
        var newPath = path

        eventResource.matchEntire(query["source"].orEmpty())?.let { match ->
            query.remove("source")
            query["source_resource"] = match.groupValues[1]
            query["source_id"] = match.groupValues[2]
            newPath = "/rpc/event_source"
        }

        eventResource.matchEntire(query["subject"].orEmpty())?.let { match ->
            query.remove("subject")
            query["subject_resource"] = match.groupValues[1]
            query["subject_id"] = match.groupValues[2]
            newPath = "/rpc/event_subject"
        }

        return UpstreamTarget(newPath)
    }
}

/**
 * Reading attachments: served from the `attachment` schema of PostgREST, and listing requires
 * the application to be given.
 */
class AttachmentReadVariant(private val resource: String, private val requiredQueryParameter: String?) : PostgrestRouteVariant {
    override fun validate(query: Parameters): RequestRejection? =
        if (requiredQueryParameter != null && !query.contains(requiredQueryParameter)) {
            RequestRejection(HttpStatusCode.BadRequest, "missing required query parameter: $requiredQueryParameter")
        } else {
            null
        }

    override fun requiredScope(method: HttpMethod, path: String): Scope =
        Scope(ScopeVerb.Read, "attachment:$resource")

    override fun rewrite(path: String, query: ParametersBuilder): UpstreamTarget =
        UpstreamTarget(path, mapOf("Accept-Profile" to "attachment"))
}

private const val GRID_ASSET = "grid"
private const val DEFAULT_PROXIMITY_LIMIT = "10"

/** Reading the grid API: served from the `grid` schema of PostgREST, with scopes on the `grid` asset. */
open class GridReadVariant : PostgrestRouteVariant {
    override fun requiredScope(method: HttpMethod, path: String): Scope = defaultRequiredScope(method, path, GRID_ASSET)

    override fun rewrite(path: String, query: ParametersBuilder): UpstreamTarget =
        UpstreamTarget(path, mapOf("Accept-Profile" to GRID_ASSET))
}

/**
 * `GET /substation`: `order=proximity` targets the `substation_distance` function instead of the table,
 * which gives the geographical filtering. The result is limited to 10 unless a limit is given.
 */
object GridSubstationListVariant : GridReadVariant() {
    override fun rewrite(path: String, query: ParametersBuilder): UpstreamTarget {
        if (query["order"] != "proximity") return super.rewrite(path, query)

        query.remove("order")
        if (query["limit"]?.toIntOrNull() == null) query["limit"] = DEFAULT_PROXIMITY_LIMIT
        return super.rewrite("/rpc/substation_distance", query)
    }
}
