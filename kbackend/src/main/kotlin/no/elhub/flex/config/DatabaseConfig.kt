package no.elhub.flex.config

import io.ktor.server.config.ApplicationConfig
import io.ktor.server.config.getAs
import kotlinx.serialization.Serializable

@Serializable
data class DatabaseConfig(
    val url: String,
    val driverClass: String = "org.postgresql.Driver",
    val username: String,
    val password: String,
    val hikari: Hikari = Hikari(),
) {
    @Serializable
    data class Hikari(val maximumPoolSize: Int = 10)
}

fun ApplicationConfig.databaseConfig(): DatabaseConfig = property("ktor.database").getAs()
