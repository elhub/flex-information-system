package no.elhub.flex.util

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.ktor.http.content.MultiPartData
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.ApplicationRequest
import io.ktor.server.request.receive
import io.ktor.server.request.receiveMultipart
import io.ktor.server.routing.RoutingCall
import no.elhub.flex.model.error.BadRequestError
import no.elhub.flex.model.error.MissingHeaderError
import no.elhub.flex.model.error.MissingPathParameterError
import no.elhub.flex.model.error.MissingQueryParameterError
import no.elhub.flex.model.error.MultipartError

/** Typed helper to get a header by name. */
fun ApplicationRequest.header(name: String): Either<MissingHeaderError, String> =
    headers[name]?.right() ?: MissingHeaderError(name).left()

/** Receives and deserializes the request body, returning a [BadRequestError] if parsing fails. */
suspend inline fun <reified T : Any> ApplicationCall.body(): Either<BadRequestError, T> =
    Either.catch { receive<T>() }
        .mapLeft { _ ->
            BadRequestError("Could not parse request body.")
        }

/** Typed helper to get a path parameter by name. */
fun RoutingCall.pathParameter(name: String): Either<MissingPathParameterError, String> =
    pathParameters[name]?.right() ?: MissingPathParameterError(name).left()

/** Typed helper to get a query parameter by name. */
fun ApplicationRequest.queryParameter(name: String): Either<MissingQueryParameterError, String> =
    queryParameters[name]?.right() ?: MissingQueryParameterError(name).left()

suspend fun ApplicationCall.multipart(maxSize: Long): Either<MultipartError, MultiPartData> =
    Either.catch { receiveMultipart(formFieldLimit = maxSize) }.mapLeft { _ -> MultipartError() }
