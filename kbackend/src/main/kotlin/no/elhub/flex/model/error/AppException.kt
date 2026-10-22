package no.elhub.flex.model.error

import no.elhub.flex.util.TraceIdUtil.Companion.traceIdOrUnknown

/**
 * Exception carrying an [AppError] that is translated to an HTTP response by the `StatusPages`
 * handler in [no.elhub.flex.config.configureErrorHandling].
 *
 * Throw this (or a subclass) for any expected failure; never build a response by hand in a handler.
 */
open class AppException(val error: AppError, cause: Throwable? = null) : RuntimeException(error.message, cause)

/** Thrown when a requested resource does not exist (404). */
class NotFoundException(details: String) : AppException(ResourceNotFoundError(details))

/** Thrown when the request is malformed (400). */
class BadRequestException(error: AppError) : AppException(error)

/**
 * Thrown when something unexpected fails, such as the database. The client only gets a generic
 * message with a trace ID, while [message] and [cause] are logged server side.
 */
class InternalServerException(override val message: String, cause: Throwable? = null) :
    AppException(InternalServerError(traceIdOrUnknown()), cause)
