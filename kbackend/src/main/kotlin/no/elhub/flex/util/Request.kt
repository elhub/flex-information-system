package no.elhub.flex.util

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.ApplicationRequest
import io.ktor.server.request.receive
import io.ktor.server.routing.RoutingCall
import no.elhub.flex.model.error.BadRequestError
import no.elhub.flex.model.error.MissingHeaderError

/** Typed helper to get a header by name. */
fun ApplicationRequest.header(name: String): Either<MissingHeaderError, String> =
    headers[name]?.right() ?: MissingHeaderError(name).left()

/** Receives and deserializes the request body, returning a [BadRequestError] if parsing fails. */
suspend inline fun <reified T : Any> ApplicationCall.body(): Either<BadRequestError, T> =
    Either.catch { receive<T>() }
        .mapLeft { e ->
            logger.info { "Failed to parse request body: $e" }
            BadRequestError("Could not parse request body.")
        }

/** Parses a path parameter as a [Long], returning a [BadRequestError] if the value is not a valid long. */
fun RoutingCall.longParameter(name: String): Either<BadRequestError, Long> =
    parameters[name]?.toLongOrNull()?.right()
        ?: BadRequestError(name).left()
