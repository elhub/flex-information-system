package no.elhub.flex.util

import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.slf4j.MDCContext
import kotlinx.coroutines.withContext
import no.elhub.flex.config.TraceContext
import no.elhub.flex.config.TraceInfo
import org.slf4j.MDC

class TraceIdUtil {
    companion object {
        fun traceIdOrUnknown(): String = MDC.get("trace_id") ?: "unknown"
    }
}

/**
 * Returns the [TraceContext] installed in the current coroutine context, or a fresh one if none
 * is present (e.g. in tests or if nothing is set).
 */
suspend fun currentTraceContext(): TraceContext =
    currentCoroutineContext()[TraceContext] ?: TraceContext(TraceInfo.fresh())

/**
 * Runs [block] with a [TraceContext] wrapping [traceInfo] installed in the coroutine context,
 * and with its trace IDs pushed into MDC under `trace_id` and `span_id` for structured logging.
 *
 * MDC keys are cleaned up afterwards, even on failure. Intended for non-HTTP contexts
 * (e.g. scheduled jobs) that have no Ktor call to set up trace context automatically.
 */
suspend fun <T> withTrace(traceInfo: TraceInfo, block: suspend () -> T): T {
    MDC.put("trace_id", traceInfo.traceID)
    MDC.put("span_id", traceInfo.spanID)
    try {
        return withContext(TraceContext(traceInfo) + MDCContext()) { block() }
    } finally {
        MDC.remove("trace_id")
        MDC.remove("span_id")
    }
}
