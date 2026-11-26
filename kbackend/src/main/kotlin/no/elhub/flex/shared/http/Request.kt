package no.elhub.flex.shared.http

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.ApplicationRequest
import io.ktor.server.request.requireCookie

/** A required request header is missing. */
data class MissingHeader(val name: String)

/** Typed helper to get a header by name. */
fun ApplicationRequest.header(name: String): Either<MissingHeader, String> =
    headers[name]?.right() ?: MissingHeader(name).left()

fun ApplicationCall.cookie(name: String): Either<MissingCookieError, String> =
    Either.catch { requireCookie(name) }.mapLeft { _ -> MissingCookieError(name) }
