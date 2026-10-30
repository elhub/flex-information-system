package no.elhub.flex.jobs

import com.zaxxer.hikari.HikariDataSource
import no.elhub.flex.shared.SharedModule
import no.elhub.flex.shared.adapter.AdapterClientConfig
import no.elhub.flex.shared.db.createDataSource
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

/**
 * Infrastructure every job needs: the database connection pool and the adapter client config,
 * both read from environment variables.
 *
 * Jobs connect to the database as `flex_staging_structure_data`, so `FLEX_DATABASE_USERNAME`
 * and `FLEX_DATABASE_PASSWORD` must be that role's credentials.
 */
@Module(includes = [SharedModule::class])
class JobInfrastructureModule {

    @Single(createdAtStart = true)
    fun dataSource(): HikariDataSource = dataSourceFromEnv()

    @Single(createdAtStart = true)
    fun adapterClientConfig(): AdapterClientConfig = AdapterClientConfig(
        baseUrl = requireEnv("ADAPTER_BASE_URL"),
        apiKey = requireEnv("ADAPTER_API_KEY"),
    )
}

/**
 * Creates the job connection pool. The URL and driver come from the shared `FLEX_DATABASE_*` variables;
 * the credentials are read from [usernameVar] and [passwordVar], so a job can use its own database user.
 */
fun dataSourceFromEnv(
    usernameVar: String = "FLEX_DATABASE_USERNAME",
    passwordVar: String = "FLEX_DATABASE_PASSWORD",
): HikariDataSource = createDataSource(
    url = requireEnv("FLEX_DATABASE_URL"),
    driverClass = System.getenv("FLEX_DATABASE_DRIVER_CLASS") ?: "org.postgresql.Driver",
    username = requireEnv(usernameVar),
    password = requireEnv(passwordVar),
    schema = null,
)
