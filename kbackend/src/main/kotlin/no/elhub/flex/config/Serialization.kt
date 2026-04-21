package no.elhub.flex.config

import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.contextual
import no.elhub.flex.util.BigDecimalSerializer

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
            serializersModule = SerializersModule {
                contextual(BigDecimalSerializer)
            }
        }
    install(ContentNegotiation) {
        json(json = defaultJson)
    }
}
