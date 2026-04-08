package no.elhub.flex.accountingpoint

import arrow.core.left
import arrow.core.right
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.types.shouldBeInstanceOf
import io.mockk.clearMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.integration.accountingpointadapter.AccountingPointAdapterService
import no.elhub.flex.integration.accountingpointadapter.NetworkError
import no.elhub.flex.integration.accountingpointadapter.NotFoundError
import no.elhub.flex.integration.accountingpointadapter.generated.models.EndUser
import no.elhub.flex.integration.accountingpointadapter.generated.models.EnergySupplier
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.LockTimeoutError
import no.elhub.flex.model.error.InternalServerError
import kotlin.time.Instant
import no.elhub.flex.integration.accountingpointadapter.generated.models.AccountingPoint as AdapterAccountingPoint

private val VALID_FROM = Instant.parse("2024-01-01T00:00:00Z")
private const val GSRN = "133700000000000053"
private const val AP_ID = 42L

class AccountingPointServiceTest : FunSpec({

    @Suppress("UnusedPrivateProperty")
    val db = PostgresTestContainer // ensure FlexTransaction is initialised

    val mockAdapter = mockk<AccountingPointAdapterService>()
    val mockRepo = mockk<AccountingPointRepository>()
    val service = AccountingPointServiceImpl(mockRepo, mockAdapter)

    val internalPrincipal = FlexPrincipal.internalData()

    beforeTest { clearMocks(mockRepo, mockAdapter) }

    val adapterEndUser = EndUser(businessId = "12345678901", validFrom = VALID_FROM)
    val adapterEnergySupplier = EnergySupplier(businessId = "7080001234567", validFrom = VALID_FROM)
    val adapterAccountingPoint = AdapterAccountingPoint(
        gsrn = GSRN,
        endUser = listOf(adapterEndUser),
        energySupplier = listOf(adapterEnergySupplier),
        meteringGridArea = emptyList(),
    )

    context("synchronizeAccountingPoint") {

        test("adapter failure is swallowed and returns Right(Unit)") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns
                NetworkError("timeout").left()

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            coVerify(exactly = 0) { with(internalPrincipal) { mockRepo.upsertAccountingPoint(any()) } }
        }

        test("adapter not-found is swallowed and returns Right(Unit)") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns
                NotFoundError(GSRN).left()

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            coVerify(exactly = 0) { with(internalPrincipal) { mockRepo.upsertAccountingPoint(any()) } }
        }

        test("happy path calls all repo methods in order and returns Right(Unit)") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoint(any()) } returns AP_ID.right()
                coEvery { mockRepo.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEnergySupplier(any()) } returns Unit.right()
                coEvery { mockRepo.markSyncComplete(any()) } returns Unit.right()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            with(internalPrincipal) {
                coVerify(exactly = 1) { mockRepo.upsertAccountingPoint(any()) }
                coVerify(exactly = 1) { mockRepo.lockSyncRowAndMarkStart(AP_ID) }
                coVerify(exactly = 1) { mockRepo.upsertAccountingPointEndUsers(any()) }
                coVerify(exactly = 1) { mockRepo.upsertAccountingPointEnergySupplier(any()) }
                coVerify(exactly = 1) { mockRepo.markSyncComplete(AP_ID) }
            }
        }

        test("concurrent sync (lock timeout) returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoint(any()) } returns AP_ID.right()
                coEvery { mockRepo.lockSyncRowAndMarkStart(AP_ID) } returns
                    LockTimeoutError("locked").left()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
            with(internalPrincipal) {
                coVerify(exactly = 0) { mockRepo.upsertAccountingPointEndUsers(any()) }
                coVerify(exactly = 0) { mockRepo.upsertAccountingPointEnergySupplier(any()) }
                coVerify(exactly = 0) { mockRepo.markSyncComplete(any()) }
            }
        }

        test("maps adapter data to correct domain objects before upserting") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoint(any()) } returns AP_ID.right()
                coEvery { mockRepo.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEnergySupplier(any()) } returns Unit.right()
                coEvery { mockRepo.markSyncComplete(any()) } returns Unit.right()
            }

            // when
            service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            with(internalPrincipal) {
                coVerify {
                    mockRepo.upsertAccountingPointEndUsers(
                        match { list ->
                            list.size == 1 &&
                                list[0].accountingPointId == AP_ID &&
                                list[0].endUserBusinessId == adapterEndUser.businessId &&
                                list[0].validFrom == adapterEndUser.validFrom
                        },
                    )
                    mockRepo.upsertAccountingPointEnergySupplier(
                        match { list ->
                            list.size == 1 &&
                                list[0].accountingPointId == AP_ID &&
                                list[0].energySupplierBusinessId == adapterEnergySupplier.businessId &&
                                list[0].validFrom == adapterEnergySupplier.validFrom
                        },
                    )
                }
            }
        }

        test("upsertAccountingPoint failure returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoint(any()) } returns DatabaseError("db down").left()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
        }

        test("upsertAccountingPointEndUsers failure returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoint(any()) } returns AP_ID.right()
                coEvery { mockRepo.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns DatabaseError("constraint violation").left()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
            with(internalPrincipal) {
                coVerify(exactly = 0) { mockRepo.markSyncComplete(any()) }
            }
        }

        test("upsertAccountingPointEnergySupplier failure returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoint(any()) } returns AP_ID.right()
                coEvery { mockRepo.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEnergySupplier(any()) } returns DatabaseError("not found").left()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
            with(internalPrincipal) {
                coVerify(exactly = 0) { mockRepo.markSyncComplete(any()) }
            }
        }

        test("markSyncComplete failure returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoint(any()) } returns AP_ID.right()
                coEvery { mockRepo.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEnergySupplier(any()) } returns Unit.right()
                coEvery { mockRepo.markSyncComplete(any()) } returns DatabaseError("No sync row found for accounting point $AP_ID").left()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
        }

        test("energy supplier upsert is not called when end user upsert fails") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoint(any()) } returns AP_ID.right()
                coEvery { mockRepo.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns DatabaseError("error").left()
            }

            // when
            service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            with(internalPrincipal) {
                coVerify(exactly = 0) { mockRepo.upsertAccountingPointEnergySupplier(any()) }
                coVerify(exactly = 0) { mockRepo.markSyncComplete(any()) }
            }
        }
    }
})
