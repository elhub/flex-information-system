package no.elhub.flex

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.netty.EngineMain
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureMonitoring
import no.elhub.flex.config.configureRouting
import no.elhub.flex.config.configureSerialization

/** Entry point for the adapter application. */
fun main(args: Array<String>) {
    EngineMain.main(args)
}

/**
 * Configures the main application module with logging, serialization, and
 * routing.
 */
fun Application.module() {
    install(Tracing.plugin)
    configureLogging()
    configureMonitoring()
    configureSerialization()
    configureRouting()
}
