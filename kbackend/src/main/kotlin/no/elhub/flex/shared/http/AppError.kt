package no.elhub.flex.shared.http

import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respondText
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

private val logger = KotlinLogging.logger {}

/** Custom type for all errors in the app. */
@Serializable(with = AppErrorSerializer::class)
sealed class AppError {
    /** Details about the error. */
    abstract val message: String

    /** The HTTP status code to return for this error. */
    abstract val code: HttpStatusCode

    /**
     * Writes this error as the HTTP response.
     *
     * By default the body has the shape of the `error_message` schema of the data API (`code` and `message`),
     * or is empty when the [message] is empty. Error types with another body format override this method.
     */
    open suspend fun handle(call: ApplicationCall) {
        if (message.isNotEmpty()) {
            call.respondErrorBody(
                code,
                buildJsonObject {
                    put("code", "HTTP${code.value}")
                    put("message", message)
                }
            )
        } else {
            call.respondText("", status = code)
        }
    }
}

/** Responds with [body] as JSON and the given [status]. */
internal suspend fun ApplicationCall.respondErrorBody(status: HttpStatusCode, body: JsonObject) {
    respondText(Json.encodeToString(JsonObject.serializer(), body), ContentType.Application.Json, status)
}

/**
 * Serializes any [AppError] as a flat JSON object with only `message` and `code`,
 * without a polymorphic type discriminator.
 */
internal object AppErrorSerializer : KSerializer<AppError> {
    // using an auxiliary data class to avoid having to write serialization code manually
    @Serializable
    private data class AppErrorAux(
        val message: String,
        @Serializable(with = HttpStatusCodeSerializer::class)
        val code: HttpStatusCode,
    )

    override val descriptor: SerialDescriptor = AppErrorAux.serializer().descriptor

    override fun serialize(encoder: Encoder, value: AppError) {
        encoder.encodeSerializableValue(
            AppErrorAux.serializer(),
            AppErrorAux(value.message, value.code),
        )
    }

    override fun deserialize(decoder: Decoder): AppError {
        val aux = decoder.decodeSerializableValue(AppErrorAux.serializer())
        // always deserialize to one of the error types, we don't care which one since they all have the same structure
        return NetworkError(aux.message, aux.code)
    }
}

/**
 * Error of the auth API, whose body has the shape of the `error_message` schema of that API:
 * `code`, `message` (the status text), and optionally `details` and `hint`.
 *
 * @property detail what went wrong, serialized as `details`
 * @property hint an optional hint to help resolve the error
 * @property code the HTTP status code
 */
data class AuthError(
    val detail: String,
    val hint: String? = null,
    override val code: HttpStatusCode = HttpStatusCode.BadRequest,
) : AppError() {
    override val message: String = code.description

    override suspend fun handle(call: ApplicationCall) {
        if (code == HttpStatusCode.InternalServerError) {
            logger.error { "$detail${hint?.let { ": $it" }.orEmpty()}" }
        }
        call.respondErrorBody(
            code,
            buildJsonObject {
                put("code", "HTTP${code.value}")
                put("message", message)
                if (detail.isNotEmpty()) put("details", detail)
                if (!hint.isNullOrEmpty()) put("hint", hint)
            }
        )
    }
}

/** Error indicating an authentication failure. */
data class AuthenticationError(
    override val message: String = "Unauthorized",
    override val code: HttpStatusCode = HttpStatusCode.Unauthorized
) : AppError()

/**
 * Error indicating a path parameter is missing from the request.
 *
 * @property name the name of the missing parameter
 * @property code the HTTP status code
 */
data class MissingPathParameterError(
    val name: String,
    override val code: HttpStatusCode = HttpStatusCode.BadRequest,
) : AppError() {
    override val message: String = "Missing path parameter '$name'"
}

/**
 * Error indicating a cookie is missing from the request.
 *
 * @property name the name of the missing cookie
 * @property code the HTTP status code
 */
data class MissingCookieError(
    val name: String,
    override val code: HttpStatusCode = HttpStatusCode.NoContent,
    // default empty body when returning NoContent
    override val message: String = ""
) : AppError()

/**
 * Error indicating a query parameter is missing from the request.
 *
 * @property name the name of the missing parameter
 * @property code the HTTP status code
 */
data class MissingQueryParameterError(
    val name: String,
    override val code: HttpStatusCode = HttpStatusCode.BadRequest,
) : AppError() {
    override val message: String = "Missing query parameter '$name'"
}

/**
 * Error indicating that a multipart body could not be parsed from the request.
 *
 * @property code the HTTP status code
 */
data class MultipartError(
    override val code: HttpStatusCode = HttpStatusCode.BadRequest,
) : AppError() {
    override val message: String = "Could not parse multipart body"
}

/**
 * Error indicating bad input data as part of a request.
 *
 * @property name the parameter name of the bad input
 * @property code the HTTP status code
 */
data class BadRequestError(
    val name: String,
    override val code: HttpStatusCode = HttpStatusCode.BadRequest,
) : AppError() {
    override val message: String = "Bad input for '$name'"
}

/**
 * Error indicating that something could not be parsed correctly.
 *
 * @property details details about the problem
 * @property code the HTTP status code
 */
data class ParsingError(
    val details: String,
    override val code: HttpStatusCode = HttpStatusCode.BadRequest,
) : AppError() {
    override val message: String = details
}

/**
 * Error indicating that a network call failed.
 *
 * @property details details about the problem
 * @property code the HTTP status code
 */
data class NetworkError(
    val details: String,
    override val code: HttpStatusCode = HttpStatusCode.InternalServerError,
) : AppError() {
    override val message: String = details
}

/**
 * Error indicating wrong end user
 *
 * @property details details about the problem
 * @property code the HTTP status code
 */
data class EndUserError(
    val details: String,
    override val code: HttpStatusCode = HttpStatusCode.Forbidden,
) : AppError() {
    override val message: String = details
}

/**
 * Error indicating that the caller is not authorised to perform the requested action
 *
 * @property details details about the problem
 * @property code the HTTP status code
 */
data class ForbiddenError(
    val details: String,
    override val code: HttpStatusCode = HttpStatusCode.Forbidden,
) : AppError() {
    override val message: String = details
}

/**
 * Error indicating something went wrong when fetching data
 *
 * @property details details about the problem
 * @property code the HTTP status code
 */
data class DataFetchError(
    val details: String,
    override val code: HttpStatusCode = HttpStatusCode.InternalServerError,
) : AppError() {
    override val message: String = details
}

/**
 * Error indicating that a resource was not found
 *
 * @property details details about the problem
 * @property code the HTTP status code
 */
data class ResourceNotFoundError(
    val details: String,
    override val code: HttpStatusCode = HttpStatusCode.NotFound,
) : AppError() {
    override val message: String = details
}

/**
 * Error used when an unexpected error occurs.
 * Responds with a generic message to avoid leaking internal details.
 */
data class InternalServerError(
    val traceId: String,
) : AppError() {
    override val code: HttpStatusCode = HttpStatusCode.InternalServerError
    override val message: String = "An unexpected error occurred. If the issue persist, give this Trace ID to support: $traceId"

    override suspend fun handle(call: ApplicationCall) {
        logger.error { message }
        super.handle(call)
    }
}
