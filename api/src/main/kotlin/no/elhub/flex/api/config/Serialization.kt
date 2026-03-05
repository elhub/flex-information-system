package no.elhub.flex.api.config

import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import kotlinx.serialization.json.Json

/** Configures the content negotiation plugin with Elhub default JSON serialization settings. */
fun Application.configureSerialization() {
    val defaultJson =
        Json {
            encodeDefaults = true
            explicitNulls = false
            isLenient = true
            allowSpecialFloatingPointValues = true
            allowStructuredMapKeys = true
            prettyPrint = false
            useArrayPolymorphism = true
            ignoreUnknownKeys = true
        }
    install(ContentNegotiation) {
        json(json = defaultJson)
    }
}
