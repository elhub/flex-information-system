package no.elhub.flex.config

import arrow.core.Either
import arrow.core.flatMap
import arrow.core.raise.either
import io.ktor.server.application.ApplicationCallPipeline
import io.ktor.server.application.createApplicationPlugin
import io.ktor.util.AttributeKey
import kotlinx.coroutines.withContext
import no.elhub.flex.model.error.ParsingError
import no.elhub.flex.util.header
import java.security.SecureRandom
import kotlin.ByteArray
import kotlin.coroutines.CoroutineContext

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

/**
 * Carries [TraceInfo] through the coroutine context so that any suspend function can access
 * the current trace without it being threaded explicitly through every call signature.
 *
 * Installed into the coroutine context by the [Tracing] plugin for HTTP requests, and by
 * [no.elhub.flex.util.withTrace] for non-HTTP contexts such as scheduled jobs.
 */
@JvmInline
value class TraceContext(val traceInfo: TraceInfo) : CoroutineContext.Element {
    companion object Key : CoroutineContext.Key<TraceContext>
    override val key: CoroutineContext.Key<*> get() = Key
}

/**
 * Representation of a trace header (`traceparent` or `traceresponse`) in the
 * [W3C Trace Context format](https://www.w3.org/TR/trace-context/#traceparent-header-field-values), with possibility
 * to store extra information about the parent span.
 *
 * A [TraceInfo] is to be stored for logging and downstream calls.
 *
 * @property traceID The trace ID, a 16-byte hex string
 * @property spanID The span ID, an 8-byte hex string.
 * @property flags The flags, a 1-byte hex string.
 * @property parentSpanID The parent span ID, an optional 8-byte hex string.
 */
@ConsistentCopyVisibility
data class TraceInfo private constructor(
    val traceID: String,
    val spanID: String,
    val flags: String,
    val parentSpanID: String? = null,
) {
    // standard trace* header format
    override fun toString(): String = "00-$traceID-$spanID-$flags"

    /** Factory for parsing and validating [TraceInfo] values. */
    companion object {
        private const val TRACE_ID_SIZE_BYTES = 16
        private const val SPAN_ID_SIZE_BYTES = 8
        private val traceHeaderRegex = "^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$".toRegex()
        private val flagsRegex = "^[0-9a-f]{2}$".toRegex()
        private val spanIDRegex = "^[0-9a-f]{16}$".toRegex()
        private val random = SecureRandom()

        /** Parses and validates a [TraceInfo] from the given string. */
        fun parse(str: String): Either<ParsingError, TraceInfo> =
            either {
                val match =
                    traceHeaderRegex.matchEntire(str)
                        ?: raise(ParsingError("Invalid trace header format"))

                @Suppress("MagicNumber")
                TraceInfo(match.groupValues[1], match.groupValues[2], match.groupValues[3])
            }

        private fun freshTraceID(): String = ByteArray(TRACE_ID_SIZE_BYTES).also { random.nextBytes(it) }.toHexString()
        private fun freshSpanID(): String = ByteArray(SPAN_ID_SIZE_BYTES).also { random.nextBytes(it) }.toHexString()

        /** Creates a [TraceInfo] from the given components, validating them. */
        fun from(
            traceID: String = freshTraceID(),
            spanID: String = freshSpanID(),
            flags: String = "02", // random trace ID
            parentSpanID: String? = null
        ): Either<ParsingError, TraceInfo> =
            either {
                val traceInfo = parse("00-$traceID-$spanID-$flags").bind()
                if (parentSpanID != null && !parentSpanID.matches(spanIDRegex)) raise(ParsingError("Invalid parent span ID format"))
                if (!flags.matches(flagsRegex)) raise(ParsingError("Invalid flags format"))

                traceInfo.copy(parentSpanID = parentSpanID)
            }

        /** Creates a fresh [TraceInfo] with a new trace ID and span ID. */
        fun fresh(): TraceInfo = from().getOrNull()!! // ok because from() with no args always generates a valid object
    }
}
