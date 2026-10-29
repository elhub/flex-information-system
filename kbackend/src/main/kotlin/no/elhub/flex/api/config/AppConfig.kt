package no.elhub.flex.api.config

import io.ktor.server.config.ApplicationConfig
import io.ktor.server.config.getAs
import kotlinx.datetime.TimeZone
import kotlinx.serialization.Serializable

@Serializable
data class FlexConfig(
    val timezone: String,
    val jwtSecret: String,
) {
    init {
        TimeZone.of(timezone)
    }

    val zone: TimeZone get() = TimeZone.of(timezone)
}

@Serializable
data class AccountingPointAdapterConfig(
    val baseUrl: String,
    val apiKey: String,
    val syncEnabled: Boolean = true,
)

@Serializable
data class AttachmentStorageConfig(
    val bucket: String,
    val internalEndpoint: String,
    val publicEndpoint: String,
    val region: String = "us-east-1",
    val accessKey: String,
    val secretKey: String,
)

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

fun ApplicationConfig.flexConfig(): FlexConfig = property("flex").getAs()

fun ApplicationConfig.accountingPointAdapterConfig(): AccountingPointAdapterConfig =
    property("accountingPointAdapter").getAs()

fun ApplicationConfig.attachmentStorageConfig(): AttachmentStorageConfig =
    property("attachmentStorage").getAs()

fun ApplicationConfig.databaseConfig(): DatabaseConfig = property("ktor.database").getAs()
