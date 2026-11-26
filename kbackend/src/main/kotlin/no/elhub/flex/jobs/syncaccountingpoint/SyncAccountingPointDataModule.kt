package no.elhub.flex.jobs.syncaccountingpoint

import com.zaxxer.hikari.HikariDataSource
import kotlinx.datetime.TimeZone
import no.elhub.flex.jobs.dataSourceFromEnv
import no.elhub.flex.jobs.requireEnv
import no.elhub.flex.shared.SharedModule
import no.elhub.flex.shared.adapter.AdapterClientConfig
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

data class SyncAccountingPointDataConfig(
    val timezone: TimeZone,
)

/**
 * The sync job connects to the database with its own user (`SYNC_ACCOUNTING_POINT_DB_USERNAME` /
 * `SYNC_ACCOUNTING_POINT_DB_PASSWORD`), which must be allowed to `SET ROLE flex_internal_data` (the API's `flex_authenticator` user is).
 * It therefore does not include [no.elhub.flex.jobs.JobInfrastructureModule], which provides the default
 * job data source.
 */
@Module(includes = [SharedModule::class])
@ComponentScan("no.elhub.flex.jobs.syncaccountingpoint")
class SyncAccountingPointDataModule {

    @Single(createdAtStart = true)
    fun dataSource(): HikariDataSource = dataSourceFromEnv(
        usernameVar = "SYNC_ACCOUNTING_POINT_DB_USERNAME",
        passwordVar = "SYNC_ACCOUNTING_POINT_DB_PASSWORD",
    )

    @Single(createdAtStart = true)
    fun adapterClientConfig(): AdapterClientConfig = AdapterClientConfig(
        baseUrl = requireEnv("ADAPTER_BASE_URL"),
        apiKey = requireEnv("ADAPTER_API_KEY"),
    )

    @Single(createdAtStart = true)
    fun config(): SyncAccountingPointDataConfig =
        SyncAccountingPointDataConfig(timezone = TimeZone.of(System.getenv("FLEX_TIMEZONE") ?: "Europe/Oslo"))
}

@KoinApplication(modules = [SyncAccountingPointDataModule::class])
class SyncAccountingPointDataApp
