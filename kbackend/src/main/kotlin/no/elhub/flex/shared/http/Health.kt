package no.elhub.flex.shared.http

import com.sksamuel.cohort.Cohort
import com.sksamuel.cohort.HealthCheckRegistry
import com.sksamuel.cohort.micrometer.CohortMetrics
import com.sksamuel.cohort.threads.ThreadDeadlockHealthCheck
import io.ktor.http.ContentType
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.micrometer.core.instrument.MeterRegistry
import kotlinx.coroutines.Dispatchers
import org.koin.ktor.ext.get
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes

/** Configures health checks and exposes the /healthz and /readyz endpoints. */
fun Application.configureHealth(registry: MeterRegistry = get<MeterRegistry>()) {
    install(Cohort) {
        sysprops = true

        val checks = HealthCheckRegistry(Dispatchers.Default) {
            register("Thread Deadlocks", ThreadDeadlockHealthCheck(), Duration.ZERO, 1.minutes)
        }
        healthcheck("/healthz", checks)
        CohortMetrics(checks).bindTo(registry)
    }

    routing {
        get("/readyz") {
            call.respondText("""{"status":"ok"}""", ContentType.Application.Json)
        }
    }
}
