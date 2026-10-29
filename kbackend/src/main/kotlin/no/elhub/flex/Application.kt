package no.elhub.flex

import arrow.core.getOrElse
import com.zaxxer.hikari.HikariDataSource
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.config.ApplicationConfig
import io.ktor.server.netty.EngineMain
import kotlinx.coroutines.runBlocking
import no.elhub.flex.api.auth.FlexAuthentication
import no.elhub.flex.api.config.AccountingPointAdapterConfig
import no.elhub.flex.api.config.ConfigModule
import no.elhub.flex.api.config.Tracing
import no.elhub.flex.api.config.configureDatabase
import no.elhub.flex.api.config.configureHealth
import no.elhub.flex.api.config.configureLogging
import no.elhub.flex.api.config.configureMetrics
import no.elhub.flex.api.config.configureRouting
import no.elhub.flex.api.config.configureScheduling
import no.elhub.flex.api.config.configureSerialization
import no.elhub.flex.api.config.flexConfig
import no.elhub.flex.api.metrics.MetricsModule
import no.elhub.flex.jobs.Job
import no.elhub.flex.jobs.JobRegistry
import no.elhub.flex.jobs.requireEnv
import no.elhub.flex.jobs.syncgridmodel.GridModelRepository
import no.elhub.flex.jobs.syncgridmodel.GridModelRepositoryImpl
import no.elhub.flex.jobs.syncgridmodel.SyncGridModelDataJob
import no.elhub.flex.jobs.syncmeteringgridarea.MeteringGridAreaStagingRepository
import no.elhub.flex.jobs.syncmeteringgridarea.MeteringGridAreaStagingRepositoryImpl
import no.elhub.flex.jobs.syncmeteringgridarea.SyncMeteringGridAreaDataJob
import no.elhub.flex.shared.SharedModule
import no.elhub.flex.shared.adapter.AdapterClient
import no.elhub.flex.shared.adapter.AdapterClientConfig
import no.elhub.flex.shared.adapter.AdapterHttpClient
import no.elhub.flex.shared.db.createDataSource
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.environmentProperties
import org.koin.ktor.ext.get
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.startKoin
import kotlin.system.exitProcess

/**
 * Entry point.
 * If `JOB` is set, the application runs in job mode and only that job runs; otherwise the backend starts.
 */
fun main(args: Array<String>) {
    val job = System.getenv("JOB")
    if (!job.isNullOrBlank()) {
        runJob(job)
    } else {
        EngineMain.main(args)
    }
}

@Module(includes = [MetricsModule::class, ConfigModule::class, SharedModule::class])
@ComponentScan("no.elhub.flex.api")
class AppModule

@KoinApplication(modules = [AppModule::class])
class FlexApp

/**
 * Configures the main application module with logging, serialization, routing,
 * authentication, scheduling and database connectivity.
 */
fun Application.module() {
    install(Tracing.plugin)
    configureLogging()
    configureSerialization()
    configureDatabase()

    val flexConfig = environment.config.flexConfig()
    install(FlexAuthentication) {
        jwtSecret = flexConfig.jwtSecret
        excludedPaths += listOf("/healthz", "/metrics")
    }

    startKoin<FlexApp> {
        environmentProperties()
        modules(
            module {
                single<ApplicationConfig> { environment.config }
            }
        )
        slf4jLogger()
    }

    configureRouting()
    configureMetrics()
    configureHealth()

    configureScheduling(get<AccountingPointAdapterConfig>().syncEnabled)
}

private val logger = KotlinLogging.logger {}

/**
 * Main function when running the application in job mode.
 * Runs a single job without launching any Ktor application.
 */
fun runJob(jobName: String) {
    val job = Job.fromString(jobName).getOrElse {
        logger.error { "Unknown job: '$jobName'. Known jobs: ${Job.knownNames()}" }
        exitProcess(1)
    }

    // Manual Koin module with all dependencies to run jobs (DB, clients).
    // Jobs connect to the database as `flex_staging_structure_data`, so `FLEX_DATABASE_USERNAME`
    // and `FLEX_DATABASE_PASSWORD` must be that role's credentials.
    val jobModule = module {
        single(createdAtStart = true) {
            createDataSource(
                url = requireEnv("FLEX_DATABASE_URL"),
                driverClass = System.getenv("FLEX_DATABASE_DRIVER_CLASS") ?: "org.postgresql.Driver",
                username = requireEnv("FLEX_DATABASE_USERNAME"),
                password = requireEnv("FLEX_DATABASE_PASSWORD"),
                schema = null,
            )
        }
        single<AdapterClient> {
            AdapterHttpClient(
                AdapterClientConfig(
                    baseUrl = requireEnv("ADAPTER_BASE_URL"),
                    apiKey = requireEnv("ADAPTER_API_KEY"),
                )
            )
        }
        single<MeteringGridAreaStagingRepository> { MeteringGridAreaStagingRepositoryImpl() }
        single {
            SyncMeteringGridAreaDataJob(
                adapterClient = get(),
                meteringGridAreaRepository = get(),
                finalise = (System.getenv("SYNC_METERING_GRID_AREA_DATA_FINALISE") ?: "false").toBooleanStrict(),
            )
        }
        single<GridModelRepository> { GridModelRepositoryImpl() }
        single {
            SyncGridModelDataJob(
                adapterClient = get(),
                gridModelRepository = get(),
                finalise = (System.getenv("SYNC_GRID_MODEL_DATA_FINALISE") ?: "false").toBooleanStrict(),
            )
        }
        single { JobRegistry(get<SyncMeteringGridAreaDataJob>(), get<SyncGridModelDataJob>()) }
    }

    // isolated Koin instance, not the global one used by the backend
    val koin = koinApplication { modules(jobModule) }.koin

    logger.info { "Starting job: ${job.name}" }
    val result = koin.get<HikariDataSource>().use { runBlocking { koin.get<JobRegistry>().resolve(job).run() } }

    result.fold(
        {
            logger.error { "Job '${job.name}' failed: $it" }
            exitProcess(1)
        },
        {
            logger.info { "Job '${job.name}' completed successfully" }
            exitProcess(0)
        },
    )
}
