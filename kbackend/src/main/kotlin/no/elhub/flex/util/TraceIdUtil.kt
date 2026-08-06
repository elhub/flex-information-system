package no.elhub.flex.util

import no.elhub.flex.config.TraceInfo
import org.slf4j.MDC

class TraceIdUtil {
    companion object {
        fun traceIdOrUnknown(): String = MDC.get("trace_id") ?: "unknown"
    }
}

/**
 * Runs [block] with [traceInfo] pushed into MDC. Cleans up MDC keys afterwards,
 * even on failure. Intended for non-HTTP contexts (e.g., scheduled jobs) that
 * do not benefit from our middleware setting MDC automatically.
 */
suspend fun <T> withTrace(traceInfo: TraceInfo, block: suspend (TraceInfo) -> T): T {
    MDC.put("trace_id", traceInfo.traceID)
    MDC.put("span_id", traceInfo.spanID)
    try {
        return block(traceInfo)
    } finally {
        MDC.remove("trace_id")
        MDC.remove("span_id")
    }
}
