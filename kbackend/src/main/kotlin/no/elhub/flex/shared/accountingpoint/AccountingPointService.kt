package no.elhub.flex.shared.accountingpoint

import arrow.core.Either
import arrow.core.flatMap
import arrow.core.raise.Raise
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import no.elhub.flex.shared.accountingpoint.db.AccountingPointGridLocationRepository
import no.elhub.flex.shared.accountingpoint.db.AccountingPointMeteringGridAreaRepository
import no.elhub.flex.shared.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.shared.accountingpoint.db.SubstationRepository
import no.elhub.flex.shared.accountingpoint.model.AccountingPoint
import no.elhub.flex.shared.accountingpoint.model.AccountingPointEndUser
import no.elhub.flex.shared.accountingpoint.model.AccountingPointEnergySupplier
import no.elhub.flex.shared.accountingpoint.model.AccountingPointGridLocation
import no.elhub.flex.shared.accountingpoint.model.AccountingPointGridLocationObjectType
import no.elhub.flex.shared.accountingpoint.model.AccountingPointGridLocationQuality
import no.elhub.flex.shared.accountingpoint.model.AccountingPointGridLocationSource
import no.elhub.flex.shared.accountingpoint.model.AccountingPointId
import no.elhub.flex.shared.accountingpoint.model.AccountingPointMeteringGridArea
import no.elhub.flex.shared.accountingpoint.model.Location
import no.elhub.flex.shared.adapter.AdapterClient
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.error.AppError
import no.elhub.flex.shared.error.DataFetchError
import no.elhub.flex.shared.error.InternalServerError
import no.elhub.flex.shared.meteringgridarea.db.MeteringGridAreaRepository
import no.elhub.flex.shared.util.TraceIdUtil.Companion.traceIdOrUnknown
import org.koin.core.annotation.Single
import kotlin.time.Instant
import no.elhub.flex.shared.adapter.NotFoundError as AdapterNotFoundError
import no.elhub.flex.shared.adapter.generated.models.AccountingPoint as AdapterAccountingPoint

interface AccountingPointService {

    /**
     * Synchronizes the accounting point with the given business ID from the adapter,
     * and updates the database accordingly.
     *
     * @param accountingPointBusinessId the business ID of the accounting point to synchronize.
     * @param validFrom the date from which we will fetch data for the accounting point.
     */
    suspend fun synchronizeAccountingPoint(
        accountingPointBusinessId: String,
        validFrom: Instant
    ): Either<AppError, Unit>

    // NB: nullable results here because we want to decide at the call site what we do if no data is there

    /**
     * Gets the earliest date from which we have active data about the given accounting points in the system.
     */
    context(principal: FlexPrincipal)
    suspend fun getAccountingPointStartDates(accountingPointIds: List<Long>): Either<AppError, Map<AccountingPointId, Instant?>>
}

@Suppress("TooManyFunctions")
@Single(createdAtStart = true)
class AccountingPointServiceImpl(
    private val accountingPointRepository: AccountingPointRepository,
    private val meteringGridAreaRepository: MeteringGridAreaRepository,
    private val accountingPointMeteringGridAreaRepository: AccountingPointMeteringGridAreaRepository,
    private val accountingPointGridLocationRepository: AccountingPointGridLocationRepository,
    private val substationRepository: SubstationRepository,
    private val adapterClient: AdapterClient,
    private val controllableUnitRepository: ControllableUnitRepository,
) : AccountingPointService {
    companion object {
        private val logger = KotlinLogging.logger {}
    }
    override suspend fun synchronizeAccountingPoint(
        accountingPointBusinessId: String,
        validFrom: Instant
    ): Either<AppError, Unit> = fetchAccountingPointData(accountingPointBusinessId, validFrom)
        .flatMap { adapterAccountingPoint ->
            logger.debug { "Raw data from adapter: ${adapterAccountingPoint.anonymizedForLogging()}" }
            with(FlexPrincipal.internalData) {
                flexTransaction { _ ->
                    either {
                        val accountingPointId = accountingPointRepository.insertAccountingPointIfNotExists(
                            AccountingPoint(id = 0, businessId = accountingPointBusinessId)
                        ).mapLeft { it.toInternalServerError("insertAccountingPointIfNotExists") }.bind()

                        accountingPointRepository.lockSyncRowAndMarkStart(accountingPointId)
                            .mapLeft { err -> err.toInternalServerError("lockSyncRowAndMarkStart") }.bind()

                        if (adapterAccountingPoint.latitude != null && adapterAccountingPoint.longitude != null) {
                            accountingPointRepository.updateAccountingPointLocation(
                                accountingPointId,
                                Location(
                                    longitude = adapterAccountingPoint.longitude,
                                    latitude = adapterAccountingPoint.latitude,
                                )
                            ).mapLeft { it.toInternalServerError("updateAccountingPointLocation") }.bind()
                        }

                        updateAccountingPointMeteringGridAreas(accountingPointId, adapterAccountingPoint)
                        updateAccountingPointEndUsersAndEnergySuppliers(accountingPointId, adapterAccountingPoint)
                        updateAccountingPointGridLocation(accountingPointId, adapterAccountingPoint)

                        accountingPointRepository.markSyncComplete(accountingPointId)
                            .mapLeft { it.toInternalServerError("markSyncComplete") }.bind()
                    }
                }
            }
        }

    context(principal: FlexPrincipal)
    private suspend fun Raise<AppError>.updateAccountingPointMeteringGridAreas(
        accountingPointId: Long,
        adapterAccountingPoint: AdapterAccountingPoint,
    ) {
        val mgaBusinessIds = adapterAccountingPoint.meteringGridArea.map { it.businessId }
        val mgaMap = meteringGridAreaRepository
            .getMeteringGridAreasByBusinessIds(mgaBusinessIds)
            .mapLeft { err -> err.toInternalServerError("getMeteringGridAreasByBusinessIds") }
            .bind()
        val accountingPointMgas = adapterAccountingPoint.meteringGridArea.map { adapterMga ->
            AccountingPointMeteringGridArea(
                id = 0L,
                accountingPointId = accountingPointId,
                meteringGridAreaId = mgaMap.getValue(adapterMga.businessId).id,
                validFrom = adapterMga.validFrom,
                validTo = adapterMga.validTo,
            )
        }

        accountingPointMeteringGridAreaRepository.replaceAllFor(accountingPointMgas)
            .mapLeft { err -> err.toInternalServerError("replaceAllFor MGAs") }
            .bind()
    }

    context(principal: FlexPrincipal)
    private suspend fun Raise<AppError>.updateAccountingPointEndUsersAndEnergySuppliers(
        accountingPointId: Long,
        adapterAccountingPoint: AdapterAccountingPoint,
    ) {
        val endUsers = adapterAccountingPoint.toAccountingPointEndUsers(accountingPointId)
        val energySuppliers = adapterAccountingPoint.toAccountingPointEnergySuppliers(accountingPointId)

        accountingPointRepository.replaceAllAccountingPointEndUsers(endUsers)
            .mapLeft { it.toInternalServerError("replaceAllAccountingPointEndUsers") }.bind()

        accountingPointRepository.replaceAllAccountingPointEnergySupplier(energySuppliers)
            .mapLeft { it.toInternalServerError("replaceAllAccountingPointEnergySupplier") }.bind()
    }

    context(principal: FlexPrincipal)
    private suspend fun updateAccountingPointGridLocation(
        accountingPointId: Long,
        adapterAccountingPoint: AdapterAccountingPoint,
    ) {
        val substationBusinessId = adapterAccountingPoint.substation ?: return
        either {
            val substationName = substationRepository.getNameByBusinessId(substationBusinessId).bind()

            val mustUpdateGridLocation = accountingPointGridLocationRepository
                .getByAccountingPointId(accountingPointId)
                .bind()
                ?.let { currentGridLocation ->
                    // grid model always takes priority over other sources
                    currentGridLocation.source != AccountingPointGridLocationSource.GRID_MODEL ||
                        // a grid model location can be updated if the substation is different
                        substationBusinessId != currentGridLocation.businessId ||
                        // or if its currently stored voltage is zero
                        // (we possibly got something from the API)
                        currentGridLocation.nominalVoltage == 0.0
                }
                ?: true // if no grid location present, always update

            if (mustUpdateGridLocation) {
                accountingPointGridLocationRepository.upsert(
                    AccountingPointGridLocation(
                        accountingPointId = accountingPointId,
                        objectType = AccountingPointGridLocationObjectType.SUBSTATION,
                        businessId = substationBusinessId,
                        name = substationName,
                        nominalVoltage = 0.0, // TODO: update when grid model API provides voltage
                        additionalInformation = null,
                        source = AccountingPointGridLocationSource.GRID_MODEL,
                        quality = AccountingPointGridLocationQuality.CONFIRMED,
                    )
                ).bind()
            }
        }.fold(
            // substation update can fail if the substation has not been synced yet: we just log the issue
            { err ->
                logger.warn {
                    "grid location upsert failed for accounting point " +
                        "$accountingPointId, substation $substationBusinessId: $err"
                }
            },
            { },
        )
    }

    private fun RepositoryError.toInternalServerError(context: String): AppError {
        logger.error { "$context failed: $this" }
        return InternalServerError(traceIdOrUnknown())
    }

    private fun AdapterAccountingPoint.anonymizedForLogging(): AdapterAccountingPoint =
        copy(endUser = endUser.map { it.copy(businessId = "<HIDDEN>") })

    private fun AdapterAccountingPoint.toAccountingPointEndUsers(accountingPointId: Long): List<AccountingPointEndUser> =
        endUser.map { eu ->
            AccountingPointEndUser(
                accountingPointId = accountingPointId,
                endUserBusinessId = eu.businessId,
                validFrom = eu.validFrom,
                validTo = eu.validTo,
            )
        }

    private fun AdapterAccountingPoint.toAccountingPointEnergySuppliers(accountingPointId: Long): List<AccountingPointEnergySupplier> =
        energySupplier.map { es ->
            AccountingPointEnergySupplier(
                accountingPointId = accountingPointId,
                energySupplierBusinessId = es.businessId,
                validFrom = es.validFrom,
                validTo = es.validTo,
            )
        }

    context(principal: FlexPrincipal)
    override suspend fun getAccountingPointStartDates(accountingPointIds: List<Long>): Either<AppError, Map<AccountingPointId, Instant?>> =
        controllableUnitRepository.getAccountingPointStartDates(accountingPointIds)
            .map { apStarts ->
                apStarts.mapValues {
                    logger.debug { "Accounting point ${it.key.value} has CU start ${it.value.controllableUnitStartTime} and CUSP start ${it.value.controllableUnitServiceProviderValidTimeStart}" }
                    // earliest of both dates, or null if none exists
                    listOfNotNull(it.value.controllableUnitStartTime, it.value.controllableUnitServiceProviderValidTimeStart)
                        .minOrNull()
                }
            }
            .mapLeft { InternalServerError(traceIdOrUnknown()) }

    private suspend fun fetchAccountingPointData(
        accountingPointBusinessId: String,
        validFrom: Instant
    ): Either<AppError, AdapterAccountingPoint> =
        adapterClient.getAccountingPoint(accountingPointBusinessId, validFrom)
            .mapLeft { err ->
                when (err) {
                    is AdapterNotFoundError -> {
                        logger.info { "Accounting point not found: $accountingPointBusinessId" }
                        DataFetchError("Accounting point $accountingPointBusinessId not found", HttpStatusCode.NotFound)
                    }

                    else -> {
                        logger.warn { "Failed to fetch accounting point $accountingPointBusinessId from adapter: $err" }
                        InternalServerError(traceIdOrUnknown())
                    }
                }
            }
}
