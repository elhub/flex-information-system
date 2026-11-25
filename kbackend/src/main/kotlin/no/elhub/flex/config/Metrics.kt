package no.elhub.flex.config

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.metrics.micrometer.MicrometerMetrics
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.micrometer.core.instrument.distribution.DistributionStatisticConfig
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry
import org.koin.ktor.ext.get
import java.util.concurrent.TimeUnit

/** Histogram bucket boundaries (ms) for HTTP server latency, enabling `histogram_quantile()` in Grafana. */
private val HTTP_LATENCY_BUCKETS_MS = listOf(10L, 25L, 50L, 100L, 250L, 500L, 1000L, 2500L, 5000L, 10000L)

private fun Long.millis(): Double = TimeUnit.MILLISECONDS.toNanos(this).toDouble()

/** Configures Prometheus metrics collection and exposes the /metrics scrape endpoint. */
fun Application.configureMetrics() {
    val registry = get<PrometheusMeterRegistry>()

    install(MicrometerMetrics) {
        this.registry = registry
        distributionStatisticConfig = DistributionStatisticConfig.Builder()
            .serviceLevelObjectives(*HTTP_LATENCY_BUCKETS_MS.map { it.millis() }.toDoubleArray())
            .build()
    }

    routing {
        get("/metrics") {
            call.respondText(registry.scrape())
        }
    }
}
