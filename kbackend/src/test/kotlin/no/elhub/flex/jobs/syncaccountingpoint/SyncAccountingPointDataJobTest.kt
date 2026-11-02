package no.elhub.flex.jobs.syncaccountingpoint

import arrow.core.left
import arrow.core.right
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import io.mockk.clearAllMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.slot
import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.todayIn
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.jobs.JobError
import no.elhub.flex.shared.accountingpoint.AccountingPointService
import no.elhub.flex.shared.accountingpoint.model.AccountingPoint
import no.elhub.flex.shared.accountingpoint.model.AccountingPointId
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.error.InternalServerError
import no.elhub.flex.shared.metrics.AccountingPointSyncMetrics
import kotlin.time.Clock
import kotlin.time.Instant

@Suppress("MagicNumber")
class SyncAccountingPointDataJobTest : FunSpec({

    @Suppress("UnusedPrivateProperty")
    val db = PostgresTestContainer // ensure FlexTransaction is initialised

    val timezone = TimeZone.of("Europe/Oslo")
    val syncRepository = mockk<AccountingPointSyncRepository>()
    val accountingPointService = mockk<AccountingPointService>()

    lateinit var meterRegistry: SimpleMeterRegistry

    fun job(): SyncAccountingPointDataJob {
        meterRegistry = SimpleMeterRegistry()
        return SyncAccountingPointDataJob(
            accountingPointSyncRepository = syncRepository,
            accountingPointService = accountingPointService,
            metrics = AccountingPointSyncMetrics(meterRegistry),
            config = SyncAccountingPointDataConfig(timezone),
        )
    }

    fun counter(result: String) = meterRegistry
        .counter("flex_accounting_point_sync_processed_total", "result", result)
        .count()

    val principal = FlexPrincipal.internalData

    val ap1 = AccountingPoint(id = 1L, businessId = "133700000000000001")
    val ap2 = AccountingPoint(id = 2L, businessId = "133700000000000002")

    val startInstant = Instant.parse("2024-01-01T00:00:00Z")

    beforeTest { clearAllMocks(answers = false) }

    test("happy path: syncs all accounting points in the batch from their earliest start date") {
        // given
        with(principal) {
            coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id, ap2.id).right()
            coEvery { syncRepository.getByIds(listOf(ap1.id, ap2.id)) } returns listOf(ap1, ap2).right()
            coEvery { accountingPointService.getAccountingPointStartDates(any()) } returns
                mapOf(AccountingPointId(ap1.id) to startInstant, AccountingPointId(ap2.id) to startInstant).right()
        }
        coEvery { accountingPointService.synchronizeAccountingPoint(any(), any()) } returns Unit.right()
        val job = job()

        // when
        val result = job.run()

        // then
        result.shouldBeRight()
        coVerify(exactly = 1) { accountingPointService.synchronizeAccountingPoint(ap1.businessId, startInstant) }
        coVerify(exactly = 1) { accountingPointService.synchronizeAccountingPoint(ap2.businessId, startInstant) }
        counter("success") shouldBe 2.0
        counter("failure") shouldBe 0.0
    }

    test("no start date: falls back to today's local midnight") {
        // given
        val expectedValidFrom = Clock.System.todayIn(timezone).atStartOfDayIn(timezone)
        val validFromSlot = slot<Instant>()
        with(principal) {
            coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id).right()
            coEvery { syncRepository.getByIds(any()) } returns listOf(ap1).right()
            coEvery { accountingPointService.getAccountingPointStartDates(any()) } returns
                mapOf(AccountingPointId(ap1.id) to null).right()
        }
        coEvery { accountingPointService.synchronizeAccountingPoint(ap1.businessId, capture(validFromSlot)) } returns Unit.right()

        // when
        job().run().shouldBeRight()

        // then
        validFromSlot.captured shouldBe expectedValidFrom
    }

    test("empty batch: succeeds without further calls") {
        // given
        with(principal) {
            coEvery { syncRepository.getBatchForSync(any()) } returns emptyList<Long>().right()
        }

        // when
        job().run().shouldBeRight()

        // then
        with(principal) {
            coVerify(exactly = 0) { syncRepository.getByIds(any()) }
        }
        coVerify(exactly = 0) { accountingPointService.synchronizeAccountingPoint(any(), any()) }
    }

    test("getBatchForSync failure: returns a database error and makes no further calls") {
        // given
        with(principal) {
            coEvery { syncRepository.getBatchForSync(any()) } returns DatabaseError("db failure").left()
        }

        // when
        val result = job().run()

        // then
        result.shouldBeLeft().shouldBeInstanceOf<JobError.DatabaseError>()
        with(principal) {
            coVerify(exactly = 0) { syncRepository.getByIds(any()) }
        }
        coVerify(exactly = 0) { accountingPointService.synchronizeAccountingPoint(any(), any()) }
    }

    test("getByIds failure: returns a database error and makes no synchronize calls") {
        // given
        with(principal) {
            coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id).right()
            coEvery { syncRepository.getByIds(any()) } returns DatabaseError("db failure").left()
        }

        // when
        val result = job().run()

        // then
        result.shouldBeLeft().shouldBeInstanceOf<JobError.DatabaseError>()
        coVerify(exactly = 0) { accountingPointService.synchronizeAccountingPoint(any(), any()) }
    }

    test("getAccountingPointStartDates failure: returns an error and makes no synchronize calls") {
        // given
        with(principal) {
            coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id).right()
            coEvery { syncRepository.getByIds(any()) } returns listOf(ap1).right()
            coEvery { accountingPointService.getAccountingPointStartDates(any()) } returns
                InternalServerError("trace-id").left()
        }

        // when
        val result = job().run()

        // then
        result.shouldBeLeft().shouldBeInstanceOf<JobError.HttpClientError>()
        coVerify(exactly = 0) { accountingPointService.synchronizeAccountingPoint(any(), any()) }
    }

    test("one accounting point fails to sync: the rest are still processed and the job succeeds") {
        // given
        with(principal) {
            coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id, ap2.id).right()
            coEvery { syncRepository.getByIds(listOf(ap1.id, ap2.id)) } returns listOf(ap1, ap2).right()
            coEvery { accountingPointService.getAccountingPointStartDates(any()) } returns
                mapOf(AccountingPointId(ap1.id) to startInstant, AccountingPointId(ap2.id) to startInstant).right()
        }
        coEvery { accountingPointService.synchronizeAccountingPoint(ap1.businessId, any()) } returns InternalServerError("trace-id").left()
        coEvery { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) } returns Unit.right()
        val job = job()

        // when
        val result = job.run()

        // then
        result.shouldBeRight()
        coVerify(exactly = 1) { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) }
        counter("success") shouldBe 1.0
        counter("failure") shouldBe 1.0
    }
})
