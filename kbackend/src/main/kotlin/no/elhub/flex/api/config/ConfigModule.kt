package no.elhub.flex.api.config

import io.ktor.server.config.ApplicationConfig
import no.elhub.flex.shared.adapter.AdapterClientConfig
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
    fun adapterClientConfig(config: AccountingPointAdapterConfig): AdapterClientConfig =
        AdapterClientConfig(baseUrl = config.baseUrl, apiKey = config.apiKey)

    @Single(createdAtStart = true)
    fun attachmentStorageConfig(config: ApplicationConfig): AttachmentStorageConfig =
        config.attachmentStorageConfig()
}
