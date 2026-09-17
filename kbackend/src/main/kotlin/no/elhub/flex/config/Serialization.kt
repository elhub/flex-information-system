package no.elhub.flex.config

import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import kotlinx.serialization.json.Json

/**
 * The single [Json] configuration used across kbackend, both for Ktor's
 * [ContentNegotiation]-based responses and for the [no.elhub.flex.util.respondJson]
 * helper used by most route handlers. Keeping one shared instance ensures
 * consistent serialization behavior.
 */
val flexJson =
    Json {
        encodeDefaults = true
        explicitNulls = true
        isLenient = true
        allowSpecialFloatingPointValues = true
        allowStructuredMapKeys = true
        prettyPrint = false
        useArrayPolymorphism = true
        ignoreUnknownKeys = true
    }

fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json(json = flexJson)
    }
}
