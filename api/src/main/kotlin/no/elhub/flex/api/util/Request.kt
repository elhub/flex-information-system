package no.elhub.flex.api.util

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.ktor.server.request.ApplicationRequest

/** Typed helper to get a header by name. */
fun ApplicationRequest.header(name: String): Either<MissingHeaderError, String> =
    headers[name]?.right() ?: MissingHeaderError(name).left()
