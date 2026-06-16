package no.elhub.flex.scheduled

import arrow.core.left
import arrow.core.right
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.datetime.TimeZone
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.accountingpoint.AccountingPointService
import no.elhub.flex.accountingpoint.db.AccountingPointSyncRepository
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.ControllableUnit
import no.elhub.flex.model.domain.ControllableUnitStatus
import no.elhub.flex.model.domain.RegulationDirection
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.error.InternalServerError
import java.math.BigDecimal

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
        timezone = TimeZone.of("Europe/Oslo"),
    )

    val principal = FlexPrincipal.internalData()

    val ap1 = AccountingPoint(id = 1L, businessId = "133700000000000001")
    val ap2 = AccountingPoint(id = 2L, businessId = "133700000000000002")

    val cu = ControllableUnit(
        id = 10L,
        businessId = "cu-uuid",
        name = "CU One",
        startDate = null,
        status = ControllableUnitStatus.ACTIVE,
        regulationDirection = RegulationDirection.UP,
        maximumActivePower = BigDecimal("100.0"),
        isSmall = false,
        additionalInformation = null,
        accountingPointId = 1L,
        createdByPartyId = 0L,
    )

    beforeTest { clearAllMocks(answers = false) }

    context("runBatch") {

        test("happy path: processes all accounting points in the batch") {
            // given
            with(principal) {
                coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id, ap2.id).right()
                coEvery { accountingPointService.getByIds(listOf(ap1.id, ap2.id)) } returns listOf(ap1, ap2).right()
                coEvery { controllableUnitRepository.getByAccountingPointId(ap1.id) } returns listOf(cu).right()
                coEvery { controllableUnitRepository.getByAccountingPointId(ap2.id) } returns emptyList<ControllableUnit>().right()
            }
            coEvery { accountingPointService.synchronizeAccountingPoint(ap1.businessId, any()) } returns Unit.right()
            coEvery { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) } returns Unit.right()

            // when
            scheduler.runBatch()

            // then
            coVerify(exactly = 1) { accountingPointService.synchronizeAccountingPoint(ap1.businessId, any()) }
            coVerify(exactly = 1) { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) }
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

        test("one AP fails to sync: remaining APs in batch are still processed") {
            // given
            with(principal) {
                coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id, ap2.id).right()
                coEvery { accountingPointService.getByIds(listOf(ap1.id, ap2.id)) } returns listOf(ap1, ap2).right()
                coEvery { controllableUnitRepository.getByAccountingPointId(ap1.id) } returns listOf(cu).right()
                coEvery { controllableUnitRepository.getByAccountingPointId(ap2.id) } returns emptyList<ControllableUnit>().right()
            }
            coEvery { accountingPointService.synchronizeAccountingPoint(ap1.businessId, any()) } returns InternalServerError("trace-id").left()
            coEvery { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) } returns Unit.right()

            // when
            scheduler.runBatch()

            // then — AP 2 was processed despite AP 1 failing
            coVerify(exactly = 1) { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) }
        }

        test("getByAccountingPointId fails for one AP: remaining APs are still processed") {
            // given
            with(principal) {
                coEvery { syncRepository.getBatchForSync(any()) } returns listOf(ap1.id, ap2.id).right()
                coEvery { accountingPointService.getByIds(listOf(ap1.id, ap2.id)) } returns listOf(ap1, ap2).right()
                coEvery { controllableUnitRepository.getByAccountingPointId(ap1.id) } returns DatabaseError("db error").left()
                coEvery { controllableUnitRepository.getByAccountingPointId(ap2.id) } returns emptyList<ControllableUnit>().right()
            }
            coEvery { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) } returns Unit.right()

            // when
            scheduler.runBatch()

            // then — AP 1 failed at CU lookup, AP 2 still processed
            coVerify(exactly = 0) { accountingPointService.synchronizeAccountingPoint(ap1.businessId, any()) }
            coVerify(exactly = 1) { accountingPointService.synchronizeAccountingPoint(ap2.businessId, any()) }
        }
    }
})
