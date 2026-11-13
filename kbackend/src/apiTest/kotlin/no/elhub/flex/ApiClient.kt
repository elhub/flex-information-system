package no.elhub.flex

import io.ktor.client.request.header
import io.ktor.client.request.request
import io.ktor.client.request.setBody
import io.ktor.client.request.url
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.http.path
import io.ktor.server.testing.TestApplication
import kotlinx.serialization.json.Json
import no.elhub.flex.auth.util.makeJwt
import no.elhub.flex.testutil.SeededActor

val apiJson = Json {
    ignoreUnknownKeys = true
    encodeDefaults = false
    explicitNulls = false
}

/** PostgREST answers 406 when a single resource is requested and row level security leaves no row for it. */
val HIDDEN_BY_RLS = HttpStatusCode.NotAcceptable

/** A PATCH or DELETE that row level security denies on `entity_client` is answered with 401 and the code PT401. */
val MUTATION_DENIED_BY_RLS = HttpStatusCode.Unauthorized

const val DEFAULT_SCOPE = "manage:data manage:auth"

/** A token that makes the caller act as this actor. */
fun SeededActor.token(scope: String = DEFAULT_SCOPE): String = makeJwt(
    role = role,
    eid = eid,
    entityId = entityId.toInt(),
    partyId = (partyId ?: 0).toInt(),
    scope = scope,
)

class ApiResponse(val status: HttpStatusCode, val text: String) {
    inline fun <reified T> body(): T = apiJson.decodeFromString(text)
}

/** Calls the data API of the application under test. A null token means that the call is anonymous. */
class ApiClient(private val app: TestApplication) {

    suspend fun request(
        method: HttpMethod,
        path: String,
        token: String?,
        body: String? = null,
        query: Map<String, String> = emptyMap(),
    ): ApiResponse {
        val response = app.client.request {
            this.method = method
            url {
                path("/api/v1$path")
                query.forEach { (name, value) -> parameters.append(name, value) }
            }
            header("Api-Version", API_VERSION)
            token?.let { header("Authorization", "Bearer $it") }
            if (body != null) {
                contentType(ContentType.Application.Json)
                setBody(body)
            }
        }
        return ApiResponse(response.status, response.bodyAsText())
    }

    suspend fun get(path: String, token: String?, vararg query: Pair<String, String>): ApiResponse =
        request(HttpMethod.Get, path, token, query = query.toMap())

    suspend inline fun <reified B> post(path: String, token: String?, body: B): ApiResponse =
        request(HttpMethod.Post, path, token, apiJson.encodeToString(body))

    suspend inline fun <reified B> patch(path: String, token: String?, body: B): ApiResponse =
        request(HttpMethod.Patch, path, token, apiJson.encodeToString(body))

    suspend fun delete(path: String, token: String?): ApiResponse =
        request(HttpMethod.Delete, path, token, "{}")
}
