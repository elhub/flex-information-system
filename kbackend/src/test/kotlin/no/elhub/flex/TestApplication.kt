package no.elhub.flex

import arrow.core.left
import arrow.core.right
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import io.mockk.coEvery
import io.mockk.mockk
import no.elhub.flex.api.accountingpoint.AccountingPointService
import no.elhub.flex.api.attachment.AttachmentStorageService
import no.elhub.flex.api.config.AccountingPointAdapterConfig
import no.elhub.flex.api.config.FlexConfig
import no.elhub.flex.api.config.Tracing
import no.elhub.flex.api.config.configureHealth
import no.elhub.flex.api.config.configureLogging
import no.elhub.flex.api.config.configureRouting
import no.elhub.flex.api.config.configureSerialization
import no.elhub.flex.api.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.api.event.db.EventRepository
import no.elhub.flex.api.metrics.FlexMetrics
import no.elhub.flex.api.model.domain.Party
import no.elhub.flex.api.model.error.DataFetchError
import no.elhub.flex.api.party.PartyService
import no.elhub.flex.api.routes.controllableunit.ControllableUnitLookup
import no.elhub.flex.api.util.TEST_JWT_SECRET
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import kotlin.time.Instant

fun defaultTestApplication(): TestApplication {
    val mockAccountingPointService = mockk<AccountingPointService>().also { svc ->
        coEvery { svc.synchronizeAccountingPoint(any(), any<Instant>()) } returns Unit.right()
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
    val mockEventRepo = mockk<EventRepository>().also { repo ->
        coEvery { with(any<FlexPrincipal>()) { repo.insertEvent(any(), any(), any(), any(), any(), any()) } } returns Unit.right()
    }
    val mockPartyService = mockk<PartyService>().also { svc ->
        coEvery { svc.getParty(any()) } returns
            Party(id = 1L, name = "Test Party", role = "flex_organisation", businessId = "123456789")
    }

    return TestApplication {
        application {
            install(Tracing.plugin)
            configureLogging()
            configureSerialization()
            install(Koin) {
                modules(
                    module {
                        single<MeterRegistry> { SimpleMeterRegistry() }
                        single<AccountingPointService> { mockAccountingPointService }
                        single<ControllableUnitRepository> { mockRepo }
                        single<EventRepository> { mockEventRepo }
                        single { FlexMetrics(get()) }
                        single<PartyService> { mockPartyService }
                        single { ControllableUnitLookup(get(), get(), get(), get(), get(), AccountingPointAdapterConfig("", ""), FlexConfig("Europe/Oslo", TEST_JWT_SECRET)) }
                        single<AttachmentStorageService> { mockk(relaxed = true) }
                    },
                )
            }
            configureRouting()
            configureHealth()
        }
    }
}
