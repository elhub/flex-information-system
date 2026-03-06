package no.elhub.flex.config

import com.sksamuel.cohort.Cohort
import com.sksamuel.cohort.HealthCheckRegistry
import com.sksamuel.cohort.micrometer.CohortMetrics
import com.sksamuel.cohort.threads.ThreadDeadlockHealthCheck
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.metrics.micrometer.MicrometerMetrics
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.micrometer.prometheusmetrics.PrometheusConfig
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry
import kotlinx.coroutines.Dispatchers
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes

/** Configures application monitoring. */
fun Application.configureMonitoring() {
    val appMicrometerRegistry = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)
    install(MicrometerMetrics) {
        registry = appMicrometerRegistry
    }

    install(Cohort) {
        sysprops = true

        val checks =
            HealthCheckRegistry(Dispatchers.Default) {
                register("Thread Deadlocks", ThreadDeadlockHealthCheck(), Duration.ZERO, 1.minutes)
            }
        healthcheck("/healthz", checks)
        CohortMetrics(checks).bindTo(appMicrometerRegistry)
    }

    routing {
        get("/metrics") {
            call.respondText(appMicrometerRegistry.scrape())
        }
    }
}
