package no.elhub.flex.config

import io.ktor.server.config.ApplicationConfig
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

@Module
class ConfigModule {

    @Single(createdAtStart = true)
    fun flexConfig(config: ApplicationConfig): FlexConfig = config.flexConfig()

    @Single(createdAtStart = true)
    fun accountingPointAdapterConfig(config: ApplicationConfig): AccountingPointAdapterConfig =
        config.accountingPointAdapterConfig()

    @Single(createdAtStart = true)
    fun attachmentStorageConfig(config: ApplicationConfig): AttachmentStorageConfig =
        config.attachmentStorageConfig()

    @Single(createdAtStart = true)
    fun mailConfig(config: ApplicationConfig): MailConfig = config.mailConfig()
}
