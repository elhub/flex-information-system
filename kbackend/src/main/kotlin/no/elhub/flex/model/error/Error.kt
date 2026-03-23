package no.elhub.flex.model.error

import io.ktor.http.HttpStatusCode
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import no.elhub.flex.util.HttpStatusCodeSerializer

/** Custom type for all errors in the app. */
@Serializable(with = AppErrorSerializer::class)
sealed class AppError {
    /** Details about the error. */
    abstract val message: String

    /** The HTTP status code to return for this error. */
    abstract val code: HttpStatusCode
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

/** Error indicating an authentication failure. */
data class AuthenticationError(
    override val message: String = "Unauthorized",
    override val code: HttpStatusCode = HttpStatusCode.Unauthorized
) : AppError()

/**
 * Error indicating a header is missing from the request.
 *
 * @property name the name of the missing header
 * @property code the HTTP status code
 */
data class MissingHeaderError(
    val name: String,
    override val code: HttpStatusCode = HttpStatusCode.BadRequest,
) : AppError() {
    override val message: String = "Missing header '$name'"
}

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
 * Error indicating bad input data as part of a request.
 *
 * @property name the parameter name of the bad input
 * @property code the HTTP status code
 */
data class BadInputError(
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
    override val code: HttpStatusCode = HttpStatusCode.InternalServerError,
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
