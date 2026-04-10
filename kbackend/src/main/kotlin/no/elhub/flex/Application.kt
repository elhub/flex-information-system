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
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.environmentProperties
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.startKoin

/** Entry point for the application. */
fun main(args: Array<String>) {
    EngineMain.main(args)
}

@Module
@ComponentScan("no.elhub.flex")
class AppModule

@KoinApplication(modules = [AppModule::class])
class FlexApp

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
        "accounting-point-adapter.sync-enabled",
    )

    startKoin<FlexApp> {
        environmentProperties()
        properties(propertiesForKoin.associateWith { environment.config.property(it).getString() })
        slf4jLogger()
    }
}
