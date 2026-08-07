package no.elhub.flex.scheduled

import arrow.core.left
import arrow.core.right
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import io.mockk.clearAllMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.slot
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.todayIn
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.accountingpoint.AccountingPointService
import no.elhub.flex.accountingpoint.db.AccountingPointSyncRepository
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.metrics.FlexMetrics
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.AccountingPointId
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.error.InternalServerError
import kotlin.time.Clock
import kotlin.time.Instant

@Suppress("MagicNumber")
class AccountingPointSyncSchedulerTest : FunSpec({

    @Suppress("UnusedPrivateProperty")
    val db = PostgresTestContainer // ensure FlexTransaction is initialised

    val syncRepository = mockk<AccountingPointSyncRepository>()
    val accountingPointService = mockk<AccountingPointService>()
    val controllableUnitRepository = mockk<ControllableUnitRepository>()

    val scheduler = AccountingPointSyncScheduler(
        accountingPointSyncRepository = syncRepository,
        accountingPointService = accountingPointService,
        controllableUnitRepository = controllableUnitRepository,
        metrics = FlexMetrics(SimpleMeterRegistry()),
        timezone = TimeZone.of("Europe/Oslo"),
    )

    val principal = FlexPrincipal.internalData()

    val ap1 = AccountingPoint(id = 1L, businessId = "133700000000000001")
    val ap2 = AccountingPoint(id = 2L, businessId = "133700000000000002")

    val startDate = LocalDate(2024, 1, 1)

    beforeTest { clearAllMocks(answers = false) }

    context("runBatch") {

        test("happy path: processes all accounting points in the batch") {
            // given
            with(principal) {
                coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id, ap2.id).right()
                coEvery { accountingPointService.getByIds(listOf(ap1.id, ap2.id)) } returns listOf(ap1, ap2).right()
                coEvery { controllableUnitRepository.getEarliestStartDateByAccountingPointIds(any()) } returns
                    mapOf(AccountingPointId(ap1.id) to startDate, AccountingPointId(ap2.id) to startDate).right()
            }
            coEvery { accountingPointService.synchronizeAccountingPoint(ap1.businessId, any()) } returns Unit.right()
            coEvery { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) } returns Unit.right()

            // when
            scheduler.runBatch()

            // then
            coVerify(exactly = 1) { accountingPointService.synchronizeAccountingPoint(ap1.businessId, any()) }
            coVerify(exactly = 1) { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) }
        }

        test("AP not in earliest start date map: falls back to todayLocalMidnight") {
            // given — no CUs with start dates for either AP
            val timezone = TimeZone.of("Europe/Oslo")
            val expectedValidFrom = Clock.System.todayIn(timezone).atStartOfDayIn(timezone)
            val validFromSlot = slot<Instant>()
            with(principal) {
                coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id).right()
                coEvery { accountingPointService.getByIds(any()) } returns listOf(ap1).right()
                coEvery { controllableUnitRepository.getEarliestStartDateByAccountingPointIds(any()) } returns
                    emptyMap<AccountingPointId, LocalDate>().right()
            }
            coEvery { accountingPointService.synchronizeAccountingPoint(ap1.businessId, capture(validFromSlot)) } returns Unit.right()

            // when
            scheduler.runBatch()

            // then — validFrom is today midnight in Europe/Oslo
            validFromSlot.captured shouldBe expectedValidFrom
        }

        test("empty batch: makes no further calls") {
            // given
            with(principal) {
                coEvery { syncRepository.getBatchForSync(any()) } returns emptyList<Long>().right()
            }

            // when
            scheduler.runBatch()

            // then
            with(principal) {
                coVerify(exactly = 0) { accountingPointService.getByIds(any()) }
            }
            coVerify(exactly = 0) { accountingPointService.synchronizeAccountingPoint(any(), any()) }
        }

        test("getBatchForSync failure: no further calls are made") {
            // given
            with(principal) {
                coEvery { syncRepository.getBatchForSync(any()) } returns DatabaseError("db failure").left()
            }

            // when
            scheduler.runBatch()

            // then
            with(principal) {
                coVerify(exactly = 0) { accountingPointService.getByIds(any()) }
            }
            coVerify(exactly = 0) { accountingPointService.synchronizeAccountingPoint(any(), any()) }
        }

        test("getByIds failure: no synchronize calls are made") {
            // given
            with(principal) {
                coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id).right()
                coEvery { accountingPointService.getByIds(any()) } returns InternalServerError("trace-id").left()
            }

            // when
            scheduler.runBatch()

            // then
            coVerify(exactly = 0) { accountingPointService.synchronizeAccountingPoint(any(), any()) }
        }

        test("getEarliestStartDateByAccountingPointIds failure: no synchronize calls are made") {
            // given
            with(principal) {
                coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id).right()
                coEvery { accountingPointService.getByIds(any()) } returns listOf(ap1).right()
                coEvery { controllableUnitRepository.getEarliestStartDateByAccountingPointIds(any()) } returns
                    DatabaseError("db failure").left()
            }

            // when
            scheduler.runBatch()

            // then
            coVerify(exactly = 0) { accountingPointService.synchronizeAccountingPoint(any(), any()) }
        }

        test("one AP fails to sync: remaining APs in batch are still processed") {
            // given
            with(principal) {
                coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id, ap2.id).right()
                coEvery { accountingPointService.getByIds(listOf(ap1.id, ap2.id)) } returns listOf(ap1, ap2).right()
                coEvery { controllableUnitRepository.getEarliestStartDateByAccountingPointIds(any()) } returns
                    mapOf(AccountingPointId(ap1.id) to startDate, AccountingPointId(ap2.id) to startDate).right()
            }
            coEvery { accountingPointService.synchronizeAccountingPoint(ap1.businessId, any()) } returns InternalServerError("trace-id").left()
            coEvery { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) } returns Unit.right()

            // when
            scheduler.runBatch()

            // then — AP 2 was processed despite AP 1 failing
            coVerify(exactly = 1) { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) }
        }
    }
})
