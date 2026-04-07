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
import no.elhub.flex.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.integration.accountingpointadapter.AccountingPointAdapterService
import no.elhub.flex.integration.accountingpointadapter.NetworkError
import no.elhub.flex.integration.accountingpointadapter.NotFoundError
import no.elhub.flex.integration.accountingpointadapter.generated.models.EndUser
import no.elhub.flex.integration.accountingpointadapter.generated.models.EnergySupplier
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.error.InternalServerError
import kotlin.time.Instant
import no.elhub.flex.integration.accountingpointadapter.generated.models.AccountingPoint as AdapterAccountingPoint

private val VALID_FROM = Instant.parse("2024-01-01T00:00:00Z")
private const val GSRN = "133700000000000053"

class AccountingPointServiceTest : FunSpec({

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
    val dbAccountingPoint = AccountingPoint(id = 42, businessId = GSRN)

    context("synchronizeAccountingPoint") {

        test("adapter failure is swallowed and returns Right(Unit)") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns
                NetworkError("timeout").left()

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            coVerify(exactly = 0) { with(internalPrincipal) { mockRepo.upsertAccountingPoints(any()) } }
        }

        test("adapter not-found is swallowed and returns Right(Unit)") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns
                NotFoundError(GSRN).left()

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            coVerify(exactly = 0) { with(internalPrincipal) { mockRepo.upsertAccountingPoints(any()) } }
        }

        test("happy path calls all repo methods in order and returns Right(Unit)") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoints(any()) } returns Unit.right()
                coEvery { mockRepo.getAccountingPointByBusinessId(GSRN) } returns dbAccountingPoint.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEnergySupplier(any()) } returns Unit.right()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            with(internalPrincipal) {
                coVerify(exactly = 1) { mockRepo.upsertAccountingPoints(any()) }
                coVerify(exactly = 1) { mockRepo.getAccountingPointByBusinessId(GSRN) }
                coVerify(exactly = 1) { mockRepo.upsertAccountingPointEndUsers(any()) }
                coVerify(exactly = 1) { mockRepo.upsertAccountingPointEnergySupplier(any()) }
            }
        }

        test("maps adapter data to correct domain objects before upserting") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoints(any()) } returns Unit.right()
                coEvery { mockRepo.getAccountingPointByBusinessId(GSRN) } returns dbAccountingPoint.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEnergySupplier(any()) } returns Unit.right()
            }

            // when
            service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            with(internalPrincipal) {
                coVerify {
                    mockRepo.upsertAccountingPointEndUsers(
                        match { list ->
                            list.size == 1 &&
                                list[0].accountingPointId == dbAccountingPoint.id &&
                                list[0].endUserBusinessId == adapterEndUser.businessId &&
                                list[0].validFrom == adapterEndUser.validFrom
                        },
                    )
                    mockRepo.upsertAccountingPointEnergySupplier(
                        match { list ->
                            list.size == 1 &&
                                list[0].accountingPointId == dbAccountingPoint.id &&
                                list[0].energySupplierBusinessId == adapterEnergySupplier.businessId &&
                                list[0].validFrom == adapterEnergySupplier.validFrom
                        },
                    )
                }
            }
        }

        test("upsertAccountingPoints failure returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoints(any()) } returns DatabaseError("db down").left()
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
                coEvery { mockRepo.upsertAccountingPoints(any()) } returns Unit.right()
                coEvery { mockRepo.getAccountingPointByBusinessId(GSRN) } returns dbAccountingPoint.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns DatabaseError("constraint violation").left()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
        }

        test("upsertAccountingPointEnergySupplier failure returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { mockRepo.upsertAccountingPoints(any()) } returns Unit.right()
                coEvery { mockRepo.getAccountingPointByBusinessId(GSRN) } returns dbAccountingPoint.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { mockRepo.upsertAccountingPointEnergySupplier(any()) } returns DatabaseError("not found").left()
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
                coEvery { mockRepo.upsertAccountingPoints(any()) } returns Unit.right()
                coEvery { mockRepo.getAccountingPointByBusinessId(GSRN) } returns dbAccountingPoint.right()
                coEvery { mockRepo.upsertAccountingPointEndUsers(any()) } returns DatabaseError("error").left()
            }

            // when
            service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            with(internalPrincipal) {
                coVerify(exactly = 0) { mockRepo.upsertAccountingPointEnergySupplier(any()) }
            }
        }
    }
})
