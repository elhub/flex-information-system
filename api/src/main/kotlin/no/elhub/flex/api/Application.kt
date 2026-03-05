package no.elhub.flex.api

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.netty.EngineMain
import no.elhub.flex.api.config.Tracing
import no.elhub.flex.api.config.configureLogging
import no.elhub.flex.api.config.configureMonitoring
import no.elhub.flex.api.config.configureRouting
import no.elhub.flex.api.config.configureSerialization

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
