package no.elhub.flex

import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureMonitoring
import no.elhub.flex.config.configureRouting
import no.elhub.flex.config.configureSerialization

fun defaultTestApplication(): TestApplication =
    TestApplication {
        application {
            this.install(Tracing.plugin)
            configureLogging()
            configureMonitoring()
            configureSerialization()
            configureRouting()
        }
    }
