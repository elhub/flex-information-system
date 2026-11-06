package no.elhub.flex

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.config.ApplicationConfig
import io.ktor.server.netty.EngineMain
import io.ktor.server.plugins.autohead.AutoHeadResponse
import no.elhub.flex.api.config.ConfigModule
import no.elhub.flex.api.config.RequireApiVersion
import no.elhub.flex.auth.AuthModule
import no.elhub.flex.auth.config.authConfig
import no.elhub.flex.auth.plugin.configureAuthentication
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureDatabase
import no.elhub.flex.config.configureHealth
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureMetrics
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.jobs.runJob
import no.elhub.flex.shared.SharedModule
import no.elhub.flex.shared.metrics.MetricsModule
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.dsl.module
import org.koin.environmentProperties
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

@Module(includes = [MetricsModule::class, ConfigModule::class, SharedModule::class, AuthModule::class])
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
    // HEAD is answered by the GET route, without a body
    install(AutoHeadResponse)
    configureLogging()
    configureSerialization()
    configureDatabase()

    val authConfig = environment.config.authConfig()
    configureAuthentication(authConfig.jwtSecret)
    install(RequireApiVersion) {
        exemptPaths += listOf("/", "/openapi.json", "/healthz", "/metrics")
        exemptPrefixes += "/auth/"
        exemptSuffixes += "/download"
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
}
