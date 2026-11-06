package no.elhub.flex.config

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.metrics.micrometer.MicrometerMetrics
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry
import org.koin.ktor.ext.get

/** Configures Prometheus metrics collection and exposes the /metrics scrape endpoint. */
fun Application.configureMetrics() {
    val registry = get<PrometheusMeterRegistry>()

    install(MicrometerMetrics) {
        this.registry = registry
    }

    routing {
        get("/metrics") {
            call.respondText(registry.scrape())
        }
    }
}
