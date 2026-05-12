package no.elhub.flex.config

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import org.slf4j.event.Level

/** Configures the call logging plugin with standard Elhub format and trace information. */
fun Application.configureLogging() {
    install(CallLogging) {
        level = Level.INFO

        mdc("trace_id") { call -> call.attributes.getOrNull(TraceKey)?.traceID }
        mdc("span_id") { call -> call.attributes.getOrNull(TraceKey)?.spanID }

        format { call ->
            val status =
                call.response
                    .status()
                    ?.value
                    .toString()
            val method = call.request.httpMethod.value
            val uri = call.request.path()
            val userAgent = call.request.headers["User-Agent"].orEmpty()
            val traceInfo = call.attributes.get(TraceKey)
            val log = "status=$status method=$method uri=$uri userAgent=$userAgent trace_id=${traceInfo.traceID} span_id=${traceInfo.spanID}"
            log + (traceInfo.parentSpanID?.let { " parent_span_id=$it" } ?: "")
        }
    }
}
