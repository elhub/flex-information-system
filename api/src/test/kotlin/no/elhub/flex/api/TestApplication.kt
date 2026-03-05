package no.elhub.flex.api

import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import no.elhub.flex.api.config.Tracing
import no.elhub.flex.api.config.configureLogging
import no.elhub.flex.api.config.configureMonitoring
import no.elhub.flex.api.config.configureRouting
import no.elhub.flex.api.config.configureSerialization

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
