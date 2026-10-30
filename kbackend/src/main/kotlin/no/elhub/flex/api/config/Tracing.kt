package no.elhub.flex.api.config

import arrow.core.flatMap
import io.ktor.server.application.ApplicationCallPipeline
import io.ktor.server.application.createApplicationPlugin
import io.ktor.util.AttributeKey
import kotlinx.coroutines.withContext
import no.elhub.flex.api.util.header
import no.elhub.flex.shared.tracing.TraceContext
import no.elhub.flex.shared.tracing.TraceInfo

/** Ktor plugin for handling W3C Trace Context headers. **/
object Tracing {

    /** The [io.ktor.server.application.ApplicationPlugin] for [Tracing]. */
    val plugin =
        createApplicationPlugin("Tracing") {
            onCall { call ->
                val traceInfo =
                    call.request
                        .header("traceparent")
                        .flatMap { TraceInfo.parse(it) }
                        .fold(
                            {
                                // missing/invalid traceparent
                                TraceInfo.fresh()
                            },
                            { traceParentInfo ->
                                // NB: span is always fresh
                                TraceInfo.from(
                                    traceID = traceParentInfo.traceID,
                                    flags = traceParentInfo.flags,
                                    parentSpanID = traceParentInfo.spanID,
                                ).getOrNull()!! // ok because based on a valid traceparent
                            }
                        )

                // set traceresponse header in the response for observability tools
                call.response.headers.append("traceresponse", traceInfo.toString())

                // store the trace context in call attributes so that the logging plugin can read it
                // (the plugin only receives a call, not the coroutine context)
                call.attributes.put(TraceContextKey, TraceContext(traceInfo))
            }

            // wrap the rest of the pipeline in the trace coroutine context so that the trace can
            // be accessed anywhere via currentTraceContext() without explicit passing
            application.intercept(ApplicationCallPipeline.Call) {
                val traceContext = context.attributes.getOrNull(TraceContextKey)
                    ?: TraceContext(TraceInfo.fresh())
                withContext(traceContext) {
                    proceed()
                }
            }
        }
}

/** Attribute key for storing [TraceContext] in Ktor call attributes. */
val TraceContextKey = AttributeKey<TraceContext>("traceContext")
