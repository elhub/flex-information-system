package no.elhub.flex

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.netty.EngineMain
import no.elhub.flex.auth.FlexAuthentication
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureDatabase
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureMonitoring
import no.elhub.flex.config.configureRouting
import no.elhub.flex.config.configureSerialization
import org.koin.environmentProperties
import org.koin.ksp.generated.defaultModule
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

/** Entry point for the application. */
fun main(args: Array<String>) {
    EngineMain.main(args)
}

/**
 * Configures the main application module with logging, serialization, routing,
 * authentication and database connectivity.
 */
fun Application.module() {
    install(Tracing.plugin)
    configureLogging()
    configureMonitoring()
    configureSerialization()
    configureDatabase()
    configureRouting()

    val jwtSecret = environment.config.property("flex.jwt-secret").getString()
    install(FlexAuthentication) {
        this.jwtSecret = jwtSecret
        excludedPaths += listOf("/healthz", "/metrics")
    }

    // Properties injected with @Property
    val propertiesForKoin = listOf(
        "accounting-point-adapter.base-url",
        "accounting-point-adapter.api-key",
    )
    install(Koin) {
        environmentProperties()
        properties(propertiesForKoin.associateWith { environment.config.property(it).getString() })
        slf4jLogger()
        modules(defaultModule)
    }
}
