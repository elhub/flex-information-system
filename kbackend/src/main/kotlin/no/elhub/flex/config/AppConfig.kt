package no.elhub.flex.config

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
data class MailConfig(
    val host: String,
    val port: Int = 587,
    val username: String = "",
    val password: String = "",
    val from: String,
    val startTls: Boolean = true,
) {
    companion object {
        /**
         * Reads the config from the `MAIL_*` environment variables, the same ones `application.yaml` uses.
         * Used in job mode, where `application.yaml` cannot be loaded. Missing values are left blank
         * so that only the job that sends mail needs them.
         */
        fun fromEnv(): MailConfig = MailConfig(
            host = System.getenv("MAIL_SMTP_HOST") ?: "",
            port = (System.getenv("MAIL_SMTP_PORT") ?: "587").toInt(),
            username = System.getenv("MAIL_SMTP_USERNAME") ?: "",
            password = System.getenv("MAIL_SMTP_PASSWORD") ?: "",
            from = System.getenv("MAIL_FROM") ?: "",
            startTls = (System.getenv("MAIL_SMTP_STARTTLS") ?: "true").toBooleanStrict(),
        )
    }
}

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

fun ApplicationConfig.mailConfig(): MailConfig = property("mail").getAs()

fun ApplicationConfig.databaseConfig(): DatabaseConfig = property("ktor.database").getAs()
