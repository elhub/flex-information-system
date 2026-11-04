package no.elhub.flex.config

import com.sksamuel.cohort.Cohort
import com.sksamuel.cohort.HealthCheckRegistry
import com.sksamuel.cohort.micrometer.CohortMetrics
import com.sksamuel.cohort.threads.ThreadDeadlockHealthCheck
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.micrometer.core.instrument.MeterRegistry
import kotlinx.coroutines.Dispatchers
import org.koin.ktor.ext.get
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes

/** Configures health checks and exposes the /healthz endpoint. */
fun Application.configureHealth() {
    val registry = get<MeterRegistry>()

    install(Cohort) {
        sysprops = true

        val checks = HealthCheckRegistry(Dispatchers.Default) {
            register("Thread Deadlocks", ThreadDeadlockHealthCheck(), Duration.ZERO, 1.minutes)
        }
        healthcheck("/healthz", checks)
        CohortMetrics(checks).bindTo(registry)
    }
}
