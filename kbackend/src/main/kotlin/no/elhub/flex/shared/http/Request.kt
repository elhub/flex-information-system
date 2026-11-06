package no.elhub.flex.shared.http

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.ktor.server.request.ApplicationRequest

/** A required request header is missing. */
data class MissingHeader(val name: String)

/** Typed helper to get a header by name. */
fun ApplicationRequest.header(name: String): Either<MissingHeader, String> =
    headers[name]?.right() ?: MissingHeader(name).left()
