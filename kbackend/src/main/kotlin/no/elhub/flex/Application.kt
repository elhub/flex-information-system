package no.elhub.flex

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.config.ApplicationConfig
import io.ktor.server.netty.EngineMain
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
import no.elhub.flex.jobs.runJob
import no.elhub.flex.shared.SharedModule
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.dsl.module
import org.koin.environmentProperties
import org.koin.ktor.ext.get
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.startKoin

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
