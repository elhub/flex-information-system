package no.elhub.flex.jobs

import no.elhub.flex.util.requireEnv

/**
 * Configuration for job mode, read once from environment variables.
 *
 * Jobs connect to the database as `flex_staging_structure_data`, so `FLEX_DATABASE_USERNAME`
 * and `FLEX_DATABASE_PASSWORD` must be that role's credentials.
 */
data class JobApplicationConfig(
    val databaseUrl: String,
    val databaseUsername: String,
    val databasePassword: String,
    val databaseDriverClass: String,
    val adapterBaseUrl: String,
    val adapterApiKey: String,
    val syncMeteringGridAreaDataFinalise: Boolean,
) {
    companion object {
        fun fromEnv(): JobApplicationConfig = JobApplicationConfig(
            databaseUrl = requireEnv("FLEX_DATABASE_URL"),
            databaseUsername = requireEnv("FLEX_DATABASE_USERNAME"),
            databasePassword = requireEnv("FLEX_DATABASE_PASSWORD"),
            databaseDriverClass = System.getenv("FLEX_DATABASE_DRIVER_CLASS") ?: "org.postgresql.Driver",
            adapterBaseUrl = requireEnv("ADAPTER_BASE_URL"),
            adapterApiKey = requireEnv("ADAPTER_API_KEY"),
            syncMeteringGridAreaDataFinalise = (System.getenv("SYNC_METERING_GRID_AREA_DATA_FINALISE") ?: "false").toBooleanStrict(),
        )
    }
}
