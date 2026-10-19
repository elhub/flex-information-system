package no.elhub.flex.jobs

import com.zaxxer.hikari.HikariDataSource
import no.elhub.flex.config.createDataSource
import no.elhub.flex.integration.adapter.AdapterClient
import no.elhub.flex.integration.adapter.AdapterHttpClient
import no.elhub.flex.util.requireEnv

/**
 * Dependencies for job mode, built once from environment variables.
 *
 * Jobs connect to the database as `flex_staging_structure_data`, so `FLEX_DATABASE_USERNAME`
 * and `FLEX_DATABASE_PASSWORD` must be that role's credentials.
 */
data class JobModule(
    val dataSource: HikariDataSource,
    val adapterClient: AdapterClient,
    val syncMeteringGridAreaDataFinalise: Boolean,
) {
    companion object {
        fun fromEnv(): JobModule {
            val databaseUrl = requireEnv("FLEX_DATABASE_URL")
            val databaseUsername = requireEnv("FLEX_DATABASE_USERNAME")
            val databasePassword = requireEnv("FLEX_DATABASE_PASSWORD")
            val databaseDriverClass = System.getenv("FLEX_DATABASE_DRIVER_CLASS") ?: "org.postgresql.Driver"
            val adapterBaseUrl = requireEnv("ADAPTER_BASE_URL")
            val adapterApiKey = requireEnv("ADAPTER_API_KEY")
            val syncMeteringGridAreaDataFinalise =
                (System.getenv("SYNC_METERING_GRID_AREA_DATA_FINALISE") ?: "false").toBooleanStrict()

            val dataSource = createDataSource(
                url = databaseUrl,
                driverClass = databaseDriverClass,
                username = databaseUsername,
                password = databasePassword,
            )

            val adapterClient = AdapterHttpClient(adapterBaseUrl, adapterApiKey)

            return JobModule(dataSource, adapterClient, syncMeteringGridAreaDataFinalise)
        }
    }
}
