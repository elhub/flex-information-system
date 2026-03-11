package no.elhub.flex

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.netty.EngineMain
import no.elhub.flex.auth.FlexAuthentication
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureDatabase
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureMonitoring
import no.elhub.flex.config.configureRouting
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.controllableunit.db.ControllableUnitRepositoryImpl
import no.elhub.flex.controllableunit.lookup.ControllableUnitLookup
import no.elhub.flex.integration.accountingpointadapter.AccountingPointAdapterHttpService
import no.elhub.flex.integration.accountingpointadapter.AccountingPointAdapterService
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

/** Entry point for the application. */
fun main(args: Array<String>) {
    EngineMain.main(args)
}

/**
 * Configures the main application module with logging, serialization, routing,
 * authentication and database connectivity.
 */
fun Application.module() {
    install(Tracing.plugin)
    configureLogging()
    configureMonitoring()
    configureSerialization()

    val jwtSecret = environment.config.property("flex.jwt_secret").getString()
    val accountingPointAdapterBaseUrl = environment.config.propertyOrNull("accounting_point_adapter.baseUrl")?.getString().orEmpty()

    install(FlexAuthentication) {
        this.jwtSecret = jwtSecret
        excludedPaths += listOf("/healthz", "/metrics")
    }

    configureDatabase()

    install(Koin) {
        slf4jLogger()
        modules(
            module {
                single<AccountingPointAdapterService> { AccountingPointAdapterHttpService(accountingPointAdapterBaseUrl) }
                single<ControllableUnitRepository> { ControllableUnitRepositoryImpl() }
                single { ControllableUnitLookup(get(), get()) }
            },
        )
    }

    configureRouting()
}
