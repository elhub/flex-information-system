package no.elhub.flex

import arrow.core.left
import arrow.core.right
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.datetime.LocalDateTime
import no.elhub.flex.accountingpoint.AccountingPointService
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureMonitoring
import no.elhub.flex.config.configureRouting
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.error.DataFetchError
import no.elhub.flex.routes.controllableunit.ControllableUnitLookup
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin

fun defaultTestApplication(): TestApplication {
    val mockAccountingPointService = mockk<AccountingPointService>().also { svc ->
        coEvery { svc.synchronizeAccountingPoint(any(), any<LocalDateTime>()) } returns Unit.right()
        coEvery { with(any<FlexPrincipal>()) { svc.getCurrentAccountingPoint(any()) } } returns
            DataFetchError("stub").left()
        coEvery { with(any<FlexPrincipal>()) { svc.getAccountingPointByBusinessId(any()) } } returns
            DataFetchError("stub").left()
        coEvery { with(any<FlexPrincipal>()) { svc.checkEndUserMatchesAccountingPoint(any(), any()) } } returns
            DataFetchError("stub").left()
    }
    val mockRepo = mockk<ControllableUnitRepository>().also { repo ->
        coEvery { with(any<FlexPrincipal>()) { repo.lookupControllableUnits(any(), any()) } } returns
            DatabaseError("stub").left()
    }

    return TestApplication {
        application {
            install(Tracing.plugin)
            configureLogging()
            configureMonitoring()
            configureSerialization()
            install(Koin) {
                modules(
                    module {
                        single<AccountingPointService> { mockAccountingPointService }
                        single<ControllableUnitRepository> { mockRepo }
                        single { ControllableUnitLookup(get(), get()) }
                    },
                )
            }
            configureRouting()
        }
    }
}
