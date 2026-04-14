package no.elhub.flex.accountingpoint

import arrow.core.Either
import arrow.core.left
import arrow.core.raise.either
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import no.elhub.flex.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.integration.accountingpointadapter.AccountingPointAdapterService
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.AccountingPointEndUser
import no.elhub.flex.model.domain.AccountingPointEnergySupplier
import no.elhub.flex.model.domain.db.LockTimeoutError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.model.error.AppError
import no.elhub.flex.model.error.DataFetchError
import no.elhub.flex.model.error.EndUserError
import no.elhub.flex.model.error.InternalServerError
import no.elhub.flex.model.error.ResourceNotFoundError
import no.elhub.flex.util.TraceIdUtil.Companion.traceIdOrUnknown
import org.koin.core.annotation.Single
import kotlin.time.Instant
import no.elhub.flex.integration.accountingpointadapter.NotFoundError as AdapterNotFoundError
import no.elhub.flex.integration.accountingpointadapter.generated.models.AccountingPoint as AdapterAccountingPoint

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

    /**
     * Returns the end-user ID if the end-user matches the accounting point, or an error if not.
     */
    context(principal: FlexPrincipal)
    suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String
    ): Either<AppError, Long>

    /**
     * Looks up an accounting point by its business ID
     *
     * Returns [ResourceNotFoundError] if not found.
     */
    context(principal: FlexPrincipal)
    suspend fun getAccountingPointByBusinessId(accountingPointBusinessId: String): Either<AppError, AccountingPoint>

    /**
     * Gets the current accounting point for a given controllable unit.
     *
     * Returns an [AccountingPoint] or [ResourceNotFoundError] when the controllable unit does not exist.
     */
    context(principal: FlexPrincipal)
    suspend fun getCurrentAccountingPoint(controllableUnitBusinessId: String): Either<AppError, AccountingPoint>
}

@Single(createdAtStart = true)
class AccountingPointServiceImpl(
    private val accountingPointRepository: AccountingPointRepository,
    private val accountingPointAdapter: AccountingPointAdapterService,
) : AccountingPointService {
    companion object {
        private val logger = KotlinLogging.logger {}
    }
    override suspend fun synchronizeAccountingPoint(
        accountingPointBusinessId: String,
        validFrom: Instant
    ): Either<AppError, Unit> = fetchAccountingPointData(accountingPointBusinessId, validFrom)
        .fold(
            ifLeft = {
                logger.warn { "Failed to fetch accounting point data for $accountingPointBusinessId — skipping sync" }
                Unit.right()
            },
            ifRight = { adapterAccountingPoint ->
                with(FlexPrincipal.internalData()) {
                    flexTransaction { _ ->
                        either {
                            val accountingPointId = accountingPointRepository.insertAccountingPointIfNotExists(
                                AccountingPoint(id = 0, businessId = accountingPointBusinessId)
                            ).mapLeft { it.toInternalServerError("insertAccountingPointIfNotExists") }.bind()

                            accountingPointRepository.lockSyncRowAndMarkStart(accountingPointId)
                                .mapLeft { err -> err.toInternalServerError("lockSyncRowAndMarkStart") }.bind()

                            val endUsers = adapterAccountingPoint.toAccountingPointEndUsers(accountingPointId)
                            val energySuppliers = adapterAccountingPoint.toAccountingPointEnergySuppliers(accountingPointId)

                            accountingPointRepository.upsertAccountingPointEndUsers(endUsers)
                                .mapLeft { it.toInternalServerError("upsertAccountingPointEndUsers") }.bind()

                            accountingPointRepository.upsertAccountingPointEnergySupplier(energySuppliers)
                                .mapLeft { it.toInternalServerError("upsertAccountingPointEnergySupplier") }.bind()

                            accountingPointRepository.markSyncComplete(accountingPointId)
                                .mapLeft { it.toInternalServerError("markSyncComplete") }.bind()
                        }
                    }
                }
            },
        )

    private fun RepositoryError.toInternalServerError(context: String): AppError {
        logger.error { "$context failed: $this" }
        return InternalServerError(traceIdOrUnknown())
    }

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
    override suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String
    ): Either<AppError, Long> = accountingPointRepository.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId).mapLeft { error ->
        when (error) {
            is NotFoundError -> EndUserError("Accounting point not found")
            else -> InternalServerError(traceIdOrUnknown())
        }
    }

    context(principal: FlexPrincipal)
    override suspend fun getAccountingPointByBusinessId(
        accountingPointBusinessId: String
    ): Either<AppError, AccountingPoint> = accountingPointRepository.getAccountingPointByBusinessId(accountingPointBusinessId).mapLeft { error ->
        when (error) {
            is NotFoundError -> ResourceNotFoundError("accounting point with business ID $accountingPointBusinessId not found")
            else -> InternalServerError(traceIdOrUnknown())
        }
    }

    context(principal: FlexPrincipal)
    override suspend fun getCurrentAccountingPoint(controllableUnitBusinessId: String): Either<AppError, AccountingPoint> = accountingPointRepository.getCurrentAccountingPoint(controllableUnitBusinessId).mapLeft { error ->
        when (error) {
            is NotFoundError -> ResourceNotFoundError("Accounting point not found")
            else -> InternalServerError(traceIdOrUnknown())
        }
    }

    private suspend fun fetchAccountingPointData(
        accountingPointBusinessId: String,
        validFrom: Instant
    ): Either<AppError, AdapterAccountingPoint> =
        accountingPointAdapter.getAccountingPoint(accountingPointBusinessId, validFrom)
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
