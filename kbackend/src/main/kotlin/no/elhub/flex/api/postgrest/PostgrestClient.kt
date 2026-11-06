package no.elhub.flex.api.postgrest

import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.client.HttpClient
import io.ktor.client.engine.apache5.Apache5
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.header
import io.ktor.client.request.headers
import io.ktor.client.request.request
import io.ktor.client.request.setBody
import io.ktor.client.request.url
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsBytes
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.http.appendPathSegments
import io.ktor.http.contentType
import io.ktor.http.takeFrom
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.header
import io.ktor.server.response.respond
import io.ktor.server.response.respondBytes
import io.ktor.server.response.respondText
import kotlinx.coroutines.CancellationException
import kotlinx.serialization.json.Json
import no.elhub.flex.api.auth.presentedJwt
import no.elhub.flex.api.config.PostgrestConfig
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.util.respondError
import no.elhub.flex.shared.tracing.currentTraceContext
import org.koin.core.annotation.Single

private val logger = KotlinLogging.logger {}

private const val REQUEST_TIMEOUT_MILLIS = 60_000L

/** Headers that describe a single connection, see RFC 9110 section 7.6.1. */
private val connectionHeaders = listOf(
    HttpHeaders.Connection,
    "Keep-Alive",
    HttpHeaders.ProxyAuthenticate,
    HttpHeaders.ProxyAuthorization,
    HttpHeaders.TE,
    HttpHeaders.Trailer,
    HttpHeaders.TransferEncoding,
    HttpHeaders.Upgrade,
)

/** Headers that the HTTP client sets by itself, or refuses to have set. */
private val headersOfHttpClient = HttpHeaders.UnsafeHeadersList + listOf(
    HttpHeaders.Host,
    HttpHeaders.ContentEncoding,
    HttpHeaders.AcceptEncoding,
)

private fun caseInsensitiveSetOf(names: Collection<String>): Set<String> =
    sortedSetOf(String.CASE_INSENSITIVE_ORDER).apply { addAll(names) }

/** Request headers that are not forwarded. The token is sent as `Authorization` from `presentedJwt`. */
private val notForwardedRequestHeaders = caseInsensitiveSetOf(
    connectionHeaders + headersOfHttpClient + listOf(HttpHeaders.Authorization, HttpHeaders.Cookie, "traceparent", "tracestate"),
)

/** Response headers that are not forwarded. */
private val notForwardedResponseHeaders = caseInsensitiveSetOf(connectionHeaders + headersOfHttpClient + "traceresponse")

/**
 * Forwards requests to PostgREST and relays the response.
 *
 * Error responses are rewritten with [rewritePostgrestError]. Responses are buffered, which is fine
 * since PostgREST limits how many rows a response can hold.
 */
@Single(createdAtStart = true)
class PostgrestClient(config: PostgrestConfig) {
    private val baseUrl = config.baseUrl.trimEnd('/')

    private val client = HttpClient(Apache5) {
        followRedirects = false
        expectSuccess = false
        engine {
            customizeClient { useSystemProperties() }
        }
        install(HttpTimeout) {
            requestTimeoutMillis = REQUEST_TIMEOUT_MILLIS
        }
    }

    /** Sends [request] to PostgREST on behalf of [call] and responds to [call] with the result. */
    suspend fun forward(call: ApplicationCall, method: HttpMethod, request: PostgrestRequest, body: ByteArray?) {
        try {
            val traceparent = currentTraceContext().traceInfo.toString()
            val response = client.request { buildRequest(call, method, request, body, traceparent) }
            relay(call, method, response)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            logger.error(e) { "PostgREST request failed: ${method.value} ${request.path}" }
            call.respondError(HttpStatusCode.BadGateway, ErrorMessage(code = "HTTP502", message = "Bad Gateway"))
        }
    }

    private fun HttpRequestBuilder.buildRequest(
        call: ApplicationCall,
        method: HttpMethod,
        request: PostgrestRequest,
        body: ByteArray?,
        traceparent: String,
    ) {
        this.method = method
        url {
            takeFrom(baseUrl)
            appendPathSegments(request.path.trim('/').split('/'))
            parameters.appendAll(request.query)
        }

        val overridden = caseInsensitiveSetOf(request.headers.keys)
        headers {
            call.request.headers.forEach { name, values ->
                if (name !in notForwardedRequestHeaders && name !in overridden) {
                    values.forEach { append(name, it) }
                }
            }
            request.headers.forEach { (name, value) -> set(name, value) }

            // PostgREST only reads the Authorization header, but sessions are carried by a cookie.
            // The token is the one that was verified here, not whatever Authorization header was sent.
            call.presentedJwt()?.let { set(HttpHeaders.Authorization, "Bearer $it") }
        }
        header("traceparent", traceparent)

        if (body != null) {
            contentType(ContentType.Application.Json)
            setBody(body)
        }
    }

    private suspend fun relay(call: ApplicationCall, method: HttpMethod, response: HttpResponse) {
        val status = response.status

        if (status.value >= HttpStatusCode.BadRequest.value) {
            val error = rewritePostgrestError(method, status, response.bodyAsText())
            logger.info { "data API failure: ${error.code} ${error.message} ${error.details.orEmpty()} ${error.hint.orEmpty()}" }
            call.respondError(status, error)
            return
        }

        response.headers.forEach { name, values ->
            if (name !in notForwardedResponseHeaders) {
                values.forEach { call.response.header(name, it) }
            }
        }

        if (status == HttpStatusCode.NoContent || status == HttpStatusCode.NotModified) {
            call.respond(status)
            return
        }

        call.respondBytes(response.bodyAsBytes(), ContentType.Application.Json, status)
    }
}
