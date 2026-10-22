package no.elhub.flex.config

import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.statuspages.StatusPages
import kotlinx.coroutines.CancellationException
import no.elhub.flex.model.error.AppException
import no.elhub.flex.model.error.InternalServerError
import no.elhub.flex.util.TraceIdUtil.Companion.traceIdOrUnknown
import no.elhub.flex.util.respondError

private val logger = KotlinLogging.logger {}

/**
 * Translates exceptions thrown from route handlers to HTTP responses, so handlers can just throw.
 *
 * - [AppException] is an expected failure and is rendered with its own status code.
 * - Anything else is a bug or an infrastructure failure: it is logged and a generic 500 is returned.
 */
fun Application.configureErrorHandling() {
    install(StatusPages) {
        exception<AppException> { call, e ->
            if (e.error is InternalServerError) {
                logger.error(e) { "Internal error: ${e.message}" }
            }
            call.respondError(e.error)
        }
        exception<Throwable> { call, e ->
            if (e is CancellationException) throw e
            logger.error(e) { "Unhandled error" }
            call.respondError(InternalServerError(traceIdOrUnknown()))
        }
    }
}
