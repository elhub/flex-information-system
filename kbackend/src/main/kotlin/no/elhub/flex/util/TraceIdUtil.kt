package no.elhub.flex.util

import org.slf4j.MDC

class TraceIdUtil {
    companion object {
        fun traceIdOrUnknown(): String = MDC.get("trace_id") ?: "unknown"
    }
}
