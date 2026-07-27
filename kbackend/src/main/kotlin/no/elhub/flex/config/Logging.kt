package no.elhub.flex.config

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import org.slf4j.event.Level

private val silentPaths = setOf("/healthz", "/metrics")

/** Configures the call logging plugin with standard Elhub format and trace information. */
fun Application.configureLogging() {
    install(CallLogging) {
        level = Level.INFO
        filter { call -> call.request.path() !in silentPaths }

        mdc("trace_id") { call -> call.attributes.getOrNull(TraceKey)?.traceID }
        mdc("span_id") { call -> call.attributes.getOrNull(TraceKey)?.spanID }
        mdc("parent_span_id") { call -> call.attributes.getOrNull(TraceKey)?.parentSpanID }
        mdc("http.method") { call -> call.request.httpMethod.value }
        mdc("http.uri") { call -> call.request.path() }
        mdc("http.status") { call -> call.response.status()?.value?.toString() }
        mdc("http.userAgent") { call -> call.request.headers["User-Agent"] }
    }
}
