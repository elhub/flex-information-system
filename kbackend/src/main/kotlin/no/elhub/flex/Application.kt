package no.elhub.flex

import arrow.core.getOrElse
import com.zaxxer.hikari.HikariDataSource
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.netty.EngineMain
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.TimeZone
import no.elhub.flex.auth.FlexAuthentication
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureDatabase
import no.elhub.flex.config.configureHealth
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureMetrics
import no.elhub.flex.config.configureRouting
import no.elhub.flex.config.configureScheduling
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.config.createDataSource
import no.elhub.flex.integration.adapter.AdapterClient
import no.elhub.flex.integration.adapter.AdapterHttpClient
import no.elhub.flex.jobs.Job
import no.elhub.flex.jobs.JobRegistry
import no.elhub.flex.jobs.SyncMeteringGridAreaDataJob
import no.elhub.flex.meteringgridarea.db.MeteringGridAreaRepository
import no.elhub.flex.meteringgridarea.db.MeteringGridAreaRepositoryImpl
import no.elhub.flex.metrics.MetricsModule
import no.elhub.flex.util.requireEnv
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.environmentProperties
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

@Module(includes = [MetricsModule::class])
@ComponentScan("no.elhub.flex")
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

    val jwtSecret = environment.config.property("flex.jwt-secret").getString()
    install(FlexAuthentication) {
        this.jwtSecret = jwtSecret
        excludedPaths += listOf("/healthz", "/metrics")
    }

    // Properties injected with @Property
    val propertiesForKoin: List<Pair<String, (String) -> Any>> = listOf(
        "accounting-point-adapter.base-url" to { it },
        "accounting-point-adapter.api-key" to { it },
        "accounting-point-adapter.sync-enabled" to { it.toBoolean() },
        "flex.timezone" to { TimeZone.of(it) },
        "mail.host" to { it },
        "mail.port" to { it.toInt() },
        "mail.username" to { it },
        "mail.password" to { it },
        "mail.from" to { it },
        "mail.start-tls" to { it.toBoolean() },
        "attachment-storage.bucket" to { it },
        "attachment-storage.internal-endpoint" to { it },
        "attachment-storage.public-endpoint" to { it },
        "attachment-storage.region" to { it },
        "attachment-storage.access-key" to { it },
        "attachment-storage.secret-key" to { it },
    )

    startKoin<FlexApp> {
        environmentProperties()
        properties(
            propertiesForKoin.associate { (id, transform) ->
                id to transform(environment.config.property(id).getString())
            }
        )
        slf4jLogger()
    }

    configureRouting()
    configureMetrics()
    configureHealth()

    val accountingPointAdapterSyncEnabled = environment.config.property("accounting-point-adapter.sync-enabled").getString().toBoolean()
    val mailScheduleEnabled = environment.config.property("mail.schedule-enabled").getString().toBoolean()
    configureScheduling(accountingPointAdapterSyncEnabled, mailScheduleEnabled)
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
            )
        }
        single<AdapterClient> {
            AdapterHttpClient(requireEnv("ADAPTER_BASE_URL"), requireEnv("ADAPTER_API_KEY"))
        }
        single<MeteringGridAreaRepository> { MeteringGridAreaRepositoryImpl() }
        single {
            SyncMeteringGridAreaDataJob(
                adapterClient = get(),
                meteringGridAreaRepository = get(),
                finalise = (System.getenv("SYNC_METERING_GRID_AREA_DATA_FINALISE") ?: "false").toBooleanStrict(),
            )
        }
        single { JobRegistry(get<SyncMeteringGridAreaDataJob>()) }
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
