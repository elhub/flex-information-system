package no.elhub.flex.config

import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.statuspages.StatusPages
import kotlinx.coroutines.CancellationException
import no.elhub.flex.shared.http.InternalServerError
import no.elhub.flex.shared.tracing.TraceIdUtil.Companion.traceIdOrUnknown

private val logger = KotlinLogging.logger {}

/**
 * Answers exceptions that no handler mapped (e.g. the database being unreachable) with the standard
 * [InternalServerError] body, which carries the trace ID, instead of an empty 500.
 *
 * Coroutine cancellations are left alone, since they are not failures.
 */
fun Application.configureErrorHandling() {
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            when (cause) {
                is CancellationException -> throw cause

                else -> {
                    logger.error(cause) { "Unhandled exception" }
                    InternalServerError(traceIdOrUnknown()).handle(call)
                }
            }
        }
    }
}
