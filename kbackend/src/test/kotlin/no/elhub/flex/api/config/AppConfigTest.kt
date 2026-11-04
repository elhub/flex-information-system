package no.elhub.flex.api.config

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.server.config.yaml.YamlConfig
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.config.authConfig
import no.elhub.flex.config.DatabaseConfig
import no.elhub.flex.config.databaseConfig

class AppConfigTest : FunSpec({

    // YamlConfig rejects unknown keys like the real application.yaml, so this mirrors its structure
    val config = requireNotNull(YamlConfig("app-config-test.yaml"))

    test("database config") {
        config.databaseConfig() shouldBe DatabaseConfig(
            url = "jdbc:postgresql://db/flex",
            username = "user",
            password = "pw",
            hikari = DatabaseConfig.Hikari(maximumPoolSize = 5),
        )
    }

    test("flex config") {
        config.flexConfig() shouldBe FlexConfig(timezone = "Europe/Oslo")
    }

    test("auth config") {
        config.authConfig() shouldBe AuthConfig(jwtSecret = "secret")
    }

    test("accounting point adapter config") {
        config.accountingPointAdapterConfig() shouldBe
            AccountingPointAdapterConfig(baseUrl = "http://adapter", apiKey = "key", syncEnabled = false)
    }

    test("attachment storage config") {
        config.attachmentStorageConfig() shouldBe AttachmentStorageConfig(
            bucket = "bucket",
            internalEndpoint = "http://internal",
            publicEndpoint = "http://public",
            region = "",
            accessKey = "ak",
            secretKey = "sk",
        )
    }
})
