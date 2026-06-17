package no.elhub.flex.accountingpoint

import arrow.core.left
import arrow.core.right
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.ktor.http.HttpStatusCode
import io.mockk.clearMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.datetime.TimeZone
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.accountingpoint.db.AccountingPointMeteringGridAreaRepository
import no.elhub.flex.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.integration.accountingpointadapter.AccountingPointAdapterService
import no.elhub.flex.integration.accountingpointadapter.NetworkError
import no.elhub.flex.integration.accountingpointadapter.NotFoundError
import no.elhub.flex.integration.accountingpointadapter.generated.models.EndUser
import no.elhub.flex.integration.accountingpointadapter.generated.models.EnergySupplier
import no.elhub.flex.meteringgridarea.db.MeteringGridAreaRepository
import no.elhub.flex.model.domain.Location
import no.elhub.flex.model.domain.MeteringGridArea
import no.elhub.flex.model.domain.MeteringGridAreaStatus
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.LockTimeoutError
import no.elhub.flex.model.error.InternalServerError
import no.elhub.flex.util.atLocalMidnight
import kotlin.time.Instant
import no.elhub.flex.integration.accountingpointadapter.generated.models.AccountingPoint as AdapterAccountingPoint
import no.elhub.flex.integration.accountingpointadapter.generated.models.MeteringGridArea as AdapterMeteringGridArea

private val timezone = TimeZone.of("Europe/Oslo")

private val VALID_FROM = Instant.parse("2024-01-01T00:00:00Z").atLocalMidnight(timezone)
private const val GSRN = "133700000000000053"
private const val AP_ID = 42L

class AccountingPointServiceTest : FunSpec({

    @Suppress("UnusedPrivateProperty")
    val db = PostgresTestContainer // ensure FlexTransaction is initialised

    val mockAdapter = mockk<AccountingPointAdapterService>()
    val accountingPointRepository = mockk<AccountingPointRepository>()
    val meteringGridAreaRepository = mockk<MeteringGridAreaRepository>()
    val accountingPointMeteringGridAreaRepository = mockk<AccountingPointMeteringGridAreaRepository>()
    val service = AccountingPointServiceImpl(
        accountingPointRepository,
        meteringGridAreaRepository,
        accountingPointMeteringGridAreaRepository,
        mockAdapter
    )

    val internalPrincipal = FlexPrincipal.internalData()

    beforeTest { clearMocks(accountingPointRepository, mockAdapter, meteringGridAreaRepository, accountingPointMeteringGridAreaRepository) }

    val adapterEndUser = EndUser(businessId = "12345678901", validFrom = VALID_FROM)
    val adapterEnergySupplier = EnergySupplier(businessId = "7080001234567", validFrom = VALID_FROM)
    val adapterMga = AdapterMeteringGridArea(businessId = "10Y000000000001O", validFrom = VALID_FROM)
    val domainMga = MeteringGridArea(id = 99L, businessId = "10Y000000000001O", name = "Test MGA", status = MeteringGridAreaStatus.ACTIVE)
    val mgaMap = mapOf(adapterMga.businessId to domainMga)
    val adapterAccountingPoint = AdapterAccountingPoint(
        gsrn = GSRN,
        endUser = listOf(adapterEndUser),
        energySupplier = listOf(adapterEnergySupplier),
        meteringGridArea = listOf(adapterMga),
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
            coVerify(exactly = 0) { with(internalPrincipal) { accountingPointRepository.insertAccountingPointIfNotExists(any()) } }
        }

        test("adapter not-found is not swallowed") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns
                NotFoundError(GSRN).left()

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().code shouldBe HttpStatusCode.NotFound
            coVerify(exactly = 0) { with(internalPrincipal) { accountingPointRepository.insertAccountingPointIfNotExists(any()) } }
        }

        test("happy path calls all repo methods in order and returns Right(Unit)") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(any()) } returns mgaMap.right()
                coEvery { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) } returns Unit.right()
                coEvery { accountingPointRepository.markSyncComplete(any()) } returns Unit.right()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            with(internalPrincipal) {
                coVerify(exactly = 1) { accountingPointRepository.insertAccountingPointIfNotExists(any()) }
                coVerify(exactly = 1) { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) }
                coVerify(exactly = 0) { accountingPointRepository.updateAccountingPointLocation(any(), any()) }
                coVerify(exactly = 1) { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) }
                coVerify(exactly = 1) { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) }
                coVerify(exactly = 1) { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) }
                coVerify(exactly = 1) { accountingPointRepository.markSyncComplete(AP_ID) }
            }
        }

        test("concurrent sync (lock timeout) returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns
                    LockTimeoutError("locked").left()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
            with(internalPrincipal) {
                coVerify(exactly = 0) { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) }
                coVerify(exactly = 0) { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) }
                coVerify(exactly = 0) { accountingPointRepository.markSyncComplete(any()) }
            }
        }

        test("maps adapter data to correct domain objects before upserting") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(any()) } returns mgaMap.right()
                coEvery { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) } returns Unit.right()
                coEvery { accountingPointRepository.markSyncComplete(any()) } returns Unit.right()
            }

            // when
            service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            with(internalPrincipal) {
                coVerify {
                    accountingPointRepository.replaceAllAccountingPointEndUsers(
                        match { list ->
                            list.size == 1 &&
                                list[0].accountingPointId == AP_ID &&
                                list[0].endUserBusinessId == adapterEndUser.businessId &&
                                list[0].validFrom == adapterEndUser.validFrom
                        },
                    )
                    accountingPointRepository.replaceAllAccountingPointEnergySupplier(
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

        test("insertAccountingPointIfNotExists failure returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns DatabaseError("db down").left()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
        }

        test("replaceAllAccountingPointEndUsers failure returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(any()) } returns mgaMap.right()
                coEvery { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) } returns DatabaseError("constraint violation").left()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
            with(internalPrincipal) {
                coVerify(exactly = 0) { accountingPointRepository.markSyncComplete(any()) }
            }
        }

        test("replaceAllAccountingPointEnergySupplier failure returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(any()) } returns mgaMap.right()
                coEvery { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) } returns DatabaseError("not found").left()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
            with(internalPrincipal) {
                coVerify(exactly = 0) { accountingPointRepository.markSyncComplete(any()) }
            }
        }

        test("markSyncComplete failure returns InternalServerError") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(any()) } returns mgaMap.right()
                coEvery { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) } returns Unit.right()
                coEvery { accountingPointRepository.markSyncComplete(any()) } returns DatabaseError("No sync row found for accounting point $AP_ID").left()
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
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(any()) } returns mgaMap.right()
                coEvery { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) } returns DatabaseError("error").left()
            }

            // when
            service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            with(internalPrincipal) {
                coVerify(exactly = 0) { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) }
                coVerify(exactly = 0) { accountingPointRepository.markSyncComplete(any()) }
            }
        }

        test("syncs location when lat/lon are both non-null") {
            // given
            val apWithLocation = adapterAccountingPoint.copy(latitude = 59.9139, longitude = 10.7522)
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns apWithLocation.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { accountingPointRepository.updateAccountingPointLocation(AP_ID, Location(10.7522, 59.9139)) } returns Unit.right()
                coEvery { meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(any()) } returns mgaMap.right()
                coEvery { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) } returns Unit.right()
                coEvery { accountingPointRepository.markSyncComplete(any()) } returns Unit.right()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            with(internalPrincipal) {
                coVerify(exactly = 1) { accountingPointRepository.updateAccountingPointLocation(AP_ID, Location(10.7522, 59.9139)) }
            }
        }

        test("does not sync location when lat/lon are explicitly null") {
            // given
            val apWithNullLocation = adapterAccountingPoint.copy(latitude = null, longitude = null)
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns apWithNullLocation.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(any()) } returns mgaMap.right()
                coEvery { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) } returns Unit.right()
                coEvery { accountingPointRepository.markSyncComplete(any()) } returns Unit.right()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            with(internalPrincipal) {
                coVerify(exactly = 0) { accountingPointRepository.updateAccountingPointLocation(any(), any()) }
            }
        }

        test("does not sync location when lat/lon are absent from response") {
            // given — adapterAccountingPoint has no lat/lon (defaults to null)
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns adapterAccountingPoint.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(any()) } returns mgaMap.right()
                coEvery { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) } returns Unit.right()
                coEvery { accountingPointRepository.markSyncComplete(any()) } returns Unit.right()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            with(internalPrincipal) {
                coVerify(exactly = 0) { accountingPointRepository.updateAccountingPointLocation(any(), any()) }
            }
        }

        test("stores all MGAs from adapter response") {
            // given
            val mga1 = AdapterMeteringGridArea(
                businessId = "10Y000000000001O",
                validFrom = Instant.parse("2020-01-01T00:00:00Z").atLocalMidnight(timezone),
                validTo = Instant.parse("2022-01-01T00:00:00Z").atLocalMidnight(timezone),
            )
            val mga2 = AdapterMeteringGridArea(
                businessId = "10Y000000000002M",
                validFrom = Instant.parse("2022-01-01T00:00:00Z").atLocalMidnight(timezone),
                validTo = null,
            )
            val mga3 = AdapterMeteringGridArea(
                businessId = "10Y000000000003K",
                validFrom = Instant.parse("2099-01-01T00:00:00Z").atLocalMidnight(timezone),
                validTo = null,
            )
            val domainMga1 = MeteringGridArea(id = 1L, businessId = mga1.businessId, name = "MGA 1", status = MeteringGridAreaStatus.ACTIVE)
            val domainMga2 = MeteringGridArea(id = 2L, businessId = mga2.businessId, name = "MGA 2", status = MeteringGridAreaStatus.ACTIVE)
            val domainMga3 = MeteringGridArea(id = 3L, businessId = mga3.businessId, name = "MGA 3", status = MeteringGridAreaStatus.ACTIVE)
            val allMgasMap = mapOf(
                mga1.businessId to domainMga1,
                mga2.businessId to domainMga2,
                mga3.businessId to domainMga3,
            )
            val apWithAllMgas = adapterAccountingPoint.copy(meteringGridArea = listOf(mga1, mga2, mga3))
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns apWithAllMgas.right()
            with(internalPrincipal) {
                coEvery { accountingPointRepository.insertAccountingPointIfNotExists(any()) } returns AP_ID.right()
                coEvery { accountingPointRepository.lockSyncRowAndMarkStart(AP_ID) } returns Unit.right()
                coEvery { meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(any()) } returns allMgasMap.right()
                coEvery { accountingPointMeteringGridAreaRepository.replaceAllFor(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEndUsers(any()) } returns Unit.right()
                coEvery { accountingPointRepository.replaceAllAccountingPointEnergySupplier(any()) } returns Unit.right()
                coEvery { accountingPointRepository.markSyncComplete(any()) } returns Unit.right()
            }

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeRight()
            with(internalPrincipal) {
                coVerify(exactly = 1) {
                    meteringGridAreaRepository.getMeteringGridAreasByBusinessIds(
                        match { ids -> ids.toSet() == setOf(mga1.businessId, mga2.businessId, mga3.businessId) },
                    )
                }
                coVerify(exactly = 1) {
                    accountingPointMeteringGridAreaRepository.replaceAllFor(
                        match { list -> list.size == 3 },
                    )
                }
            }
        }
    }
})
