package no.elhub.flex.api.postgrest

import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.client.HttpClient
import io.ktor.client.engine.apache5.Apache5
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.header
import io.ktor.client.request.headers
import io.ktor.client.request.prepareRequest
import io.ktor.client.request.setBody
import io.ktor.client.request.url
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsChannel
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.http.appendPathSegments
import io.ktor.http.content.OutgoingContent
import io.ktor.http.contentLength
import io.ktor.http.contentType
import io.ktor.http.takeFrom
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.header
import io.ktor.server.response.respond
import io.ktor.utils.io.ByteReadChannel
import io.ktor.utils.io.readBuffer
import io.ktor.utils.io.readRemaining
import kotlinx.coroutines.CancellationException
import kotlinx.io.readString
import no.elhub.flex.api.config.PostgrestConfig
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.util.respondError
import no.elhub.flex.auth.plugin.presentedJwt
import no.elhub.flex.shared.tracing.currentTraceContext
import org.koin.core.annotation.Single

private val logger = KotlinLogging.logger {}

private const val CONNECT_TIMEOUT_MILLIS = 10_000L

/** How long PostgREST may be silent. This is not a limit on the total time, since responses are streamed. */
private const val SOCKET_TIMEOUT_MILLIS = 60_000L

/** Error responses are read into memory to be rewritten, so only this much of them (1 MiB) is read. */
private const val MAX_ERROR_BODY_BYTES = 1L shl 20

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
 * Successful responses are streamed to the caller, since nothing limits how many rows a response holds.
 * Error responses are small, and are rewritten with [rewritePostgrestError].
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
            connectTimeoutMillis = CONNECT_TIMEOUT_MILLIS
            socketTimeoutMillis = SOCKET_TIMEOUT_MILLIS
        }
    }

    /** Sends [request] to PostgREST on behalf of [call] and responds to [call] with the result. */
    suspend fun forward(call: ApplicationCall, method: HttpMethod, request: PostgrestRequest, body: ByteArray?) {
        var streaming = false
        try {
            val traceparent = currentTraceContext().traceInfo.toString()
            // the response body is only readable inside execute, so the call is responded to in there
            client.prepareRequest { buildRequest(call, method, request, body, traceparent) }.execute { response ->
                if (response.status.value >= HttpStatusCode.BadRequest.value) {
                    relayError(call, method, response)
                } else {
                    streaming = true
                    relay(call, response)
                }
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            logger.error(e) { "PostgREST request failed: ${method.value} ${request.path}" }
            // once the response has started, the status can no longer change: let the connection fail
            if (streaming) throw e
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

    private suspend fun relayError(call: ApplicationCall, method: HttpMethod, response: HttpResponse) {
        val body = response.bodyAsChannel().readBuffer(MAX_ERROR_BODY_BYTES).readString()
        val error = rewritePostgrestError(method, response.status, body)
        logger.info { "data API failure: ${error.code} ${error.message} ${error.details.orEmpty()} ${error.hint.orEmpty()}" }
        // headers such as WWW-Authenticate and Content-Range still apply, the body is the only thing we replace,
        // so the length of the original body must not be sent along with the rewritten one
        copyResponseHeaders(call, response, skip = HttpHeaders.ContentLength)
        call.respondError(response.status, error)
    }

    private fun copyResponseHeaders(call: ApplicationCall, response: HttpResponse, skip: String? = null) {
        response.headers.forEach { name, values ->
            if (name !in notForwardedResponseHeaders && !name.equals(skip, ignoreCase = true)) {
                values.forEach { call.response.header(name, it) }
            }
        }
    }

    private suspend fun relay(call: ApplicationCall, response: HttpResponse) {
        copyResponseHeaders(call, response)

        if (response.status == HttpStatusCode.NoContent || response.status == HttpStatusCode.NotModified) {
            call.respond(response.status)
            return
        }

        call.respond(StreamedResponse(response, response.bodyAsChannel()))
    }
}

/** The [body] of [response], passed on as it arrives instead of being read into memory. */
private class StreamedResponse(response: HttpResponse, private val body: ByteReadChannel) : OutgoingContent.ReadChannelContent() {
    override val status: HttpStatusCode = response.status
    override val contentType: ContentType = ContentType.Application.Json
    override val contentLength: Long? = response.contentLength()

    override fun readFrom(): ByteReadChannel = body
}
