package no.elhub.flex.accountingpoint

import arrow.core.left
import arrow.core.right
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.mockk.clearMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.datetime.TimeZone
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.accountingpoint.db.AccountingPointMeteringGridAreaRepository
import no.elhub.flex.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.integration.accountingpointadapter.AccountingPointAdapterService
import no.elhub.flex.integration.accountingpointadapter.NetworkError
import no.elhub.flex.integration.accountingpointadapter.generated.models.EndUser
import no.elhub.flex.integration.accountingpointadapter.generated.models.EnergySupplier
import no.elhub.flex.meteringgridarea.db.MeteringGridAreaRepository
import no.elhub.flex.model.domain.AccountingPointId
import no.elhub.flex.model.domain.AccountingPointStartDates
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
    val controllableUnitRepository = mockk<ControllableUnitRepository>()
    val service = AccountingPointServiceImpl(
        accountingPointRepository,
        meteringGridAreaRepository,
        accountingPointMeteringGridAreaRepository,
        mockAdapter,
        controllableUnitRepository,
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

        test("fetchAccountingPointData fails and returns Left") {
            // given
            coEvery { mockAdapter.getAccountingPoint(GSRN, VALID_FROM) } returns
                NetworkError("timeout").left()

            // when
            val result = service.synchronizeAccountingPoint(GSRN, VALID_FROM)

            // then
            result.shouldBeLeft()
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

    context("getByIds") {

        val ap1 = no.elhub.flex.model.domain.AccountingPoint(id = 1L, businessId = "133700000000000001")
        val ap2 = no.elhub.flex.model.domain.AccountingPoint(id = 2L, businessId = "133700000000000002")

        test("returns accounting points from repository on success") {
            // given
            with(internalPrincipal) {
                coEvery { accountingPointRepository.getByIds(listOf(ap1.id, ap2.id)) } returns listOf(ap1, ap2).right()
            }

            // when
            val result = with(internalPrincipal) { service.getByIds(listOf(ap1.id, ap2.id)) }

            // then
            result.shouldBeRight() shouldBe listOf(ap1, ap2)
        }

        test("maps repository error to InternalServerError") {
            // given
            with(internalPrincipal) {
                coEvery { accountingPointRepository.getByIds(any()) } returns DatabaseError("db failure").left()
            }

            // when
            val result = with(internalPrincipal) { service.getByIds(listOf(ap1.id)) }

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
        }
    }

    context("getAccountingPointStartDates") {

        val apId = 10L
        val apKey = AccountingPointId(apId)

        test("returns the minimum of CU start time and CUSP valid time start") {
            // given - CU start is earlier
            val cuStart = Instant.parse("2024-01-01T00:00:00Z")
            val cuspStart = Instant.parse("2024-06-01T00:00:00Z")
            with(internalPrincipal) {
                coEvery { controllableUnitRepository.getAccountingPointStartDates(listOf(apId)) } returns mapOf(
                    apKey to AccountingPointStartDates(
                        controllableUnitStartTime = cuStart,
                        controllableUnitServiceProviderValidTimeStart = cuspStart,
                    )
                ).right()
            }

            // when
            val result = with(internalPrincipal) { service.getAccountingPointStartDates(listOf(apId)) }.shouldBeRight()

            // then - minimum of the two is CU start
            result[apKey] shouldBe cuStart
        }

        test("returns the CUSP start when it is earlier than the CU start") {
            // given - CUSP start is earlier
            val cuStart = Instant.parse("2024-06-01T00:00:00Z")
            val cuspStart = Instant.parse("2024-01-01T00:00:00Z")
            with(internalPrincipal) {
                coEvery { controllableUnitRepository.getAccountingPointStartDates(listOf(apId)) } returns mapOf(
                    apKey to AccountingPointStartDates(
                        controllableUnitStartTime = cuStart,
                        controllableUnitServiceProviderValidTimeStart = cuspStart,
                    )
                ).right()
            }

            // when
            val result = with(internalPrincipal) { service.getAccountingPointStartDates(listOf(apId)) }.shouldBeRight()

            // then - minimum of the two is CUSP start
            result[apKey] shouldBe cuspStart
        }

        test("returns CU start when CUSP start is null") {
            val cuStart = Instant.parse("2024-03-01T00:00:00Z")
            with(internalPrincipal) {
                coEvery { controllableUnitRepository.getAccountingPointStartDates(listOf(apId)) } returns mapOf(
                    apKey to AccountingPointStartDates(
                        controllableUnitStartTime = cuStart,
                        controllableUnitServiceProviderValidTimeStart = null,
                    )
                ).right()
            }

            val result = with(internalPrincipal) { service.getAccountingPointStartDates(listOf(apId)) }.shouldBeRight()
            result[apKey] shouldBe cuStart
        }

        test("returns CUSP start when CU start is null") {
            val cuspStart = Instant.parse("2024-03-01T00:00:00Z")
            with(internalPrincipal) {
                coEvery { controllableUnitRepository.getAccountingPointStartDates(listOf(apId)) } returns mapOf(
                    apKey to AccountingPointStartDates(
                        controllableUnitStartTime = null,
                        controllableUnitServiceProviderValidTimeStart = cuspStart,
                    )
                ).right()
            }

            val result = with(internalPrincipal) { service.getAccountingPointStartDates(listOf(apId)) }.shouldBeRight()
            result[apKey] shouldBe cuspStart
        }

        test("returns null when both CU start and CUSP start are null") {
            with(internalPrincipal) {
                coEvery { controllableUnitRepository.getAccountingPointStartDates(listOf(apId)) } returns mapOf(
                    apKey to AccountingPointStartDates(
                        controllableUnitStartTime = null,
                        controllableUnitServiceProviderValidTimeStart = null,
                    )
                ).right()
            }

            val result = with(internalPrincipal) { service.getAccountingPointStartDates(listOf(apId)) }.shouldBeRight()
            result[apKey] shouldBe null
        }

        test("maps repository error to InternalServerError") {
            with(internalPrincipal) {
                coEvery { controllableUnitRepository.getAccountingPointStartDates(any()) } returns DatabaseError("db failure").left()
            }

            val result = with(internalPrincipal) { service.getAccountingPointStartDates(listOf(apId)) }
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
        }
    }
})
