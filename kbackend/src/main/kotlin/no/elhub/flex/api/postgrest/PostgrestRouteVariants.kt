package no.elhub.flex.api.postgrest

import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import no.elhub.flex.api.auth.Scope
import no.elhub.flex.api.auth.ScopeVerb

/**
 * How a route served by PostgREST deviates from the generic pipeline in [buildPostgrestRequest].
 */
interface PostgrestRouteVariant {
    /** Checks that run before the scope check. */
    fun validate(query: Query): RequestRejection? = null

    /** The scope the caller must have. */
    fun requiredScope(method: HttpMethod, path: String): Scope = defaultRequiredScope(method, path)

    /** Rewrites [query] in-place; returns the path to use and headers to set. */
    fun prepare(path: String, query: Query): Pair<String, Map<String, String>> = path to emptyMap()
}

/** The generic pipeline, with no deviations. */
object PlainVariant : PostgrestRouteVariant

private val eventResource = Regex("""^eq\./([a-z_]+)/([0-9]+)$""")

/**
 * `GET /event`: `source=eq./<resource>/<id>` and `subject=eq./<resource>/<id>` filter through the
 * `event_source` and `event_subject` functions instead of the table.
 */
object EventListVariant : PostgrestRouteVariant {
    override fun prepare(path: String, query: Query): Pair<String, Map<String, String>> {
        var newPath = path

        eventResource.matchEntire(query.first("source").orEmpty())?.let { match ->
            query.remove("source")
            query.set("source_resource", match.groupValues[1])
            query.set("source_id", match.groupValues[2])
            newPath = "/rpc/event_source"
        }

        eventResource.matchEntire(query.first("subject").orEmpty())?.let { match ->
            query.remove("subject")
            query.set("subject_resource", match.groupValues[1])
            query.set("subject_id", match.groupValues[2])
            newPath = "/rpc/event_subject"
        }

        return newPath to emptyMap()
    }
}

/**
 * Reading attachments: served from the `attachment` schema of PostgREST, and listing requires
 * the application to be given.
 */
class AttachmentReadVariant(private val resource: String, private val requiredQueryParameter: String?) : PostgrestRouteVariant {
    override fun validate(query: Query): RequestRejection? =
        if (requiredQueryParameter != null && requiredQueryParameter !in query) {
            RequestRejection(HttpStatusCode.BadRequest, "missing required query parameter: $requiredQueryParameter")
        } else {
            null
        }

    override fun requiredScope(method: HttpMethod, path: String): Scope =
        Scope(ScopeVerb.Read, "attachment:$resource")

    override fun prepare(path: String, query: Query): Pair<String, Map<String, String>> =
        path to mapOf("Accept-Profile" to "attachment")
}
