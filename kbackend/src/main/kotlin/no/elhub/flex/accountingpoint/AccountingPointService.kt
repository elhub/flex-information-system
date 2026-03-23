package no.elhub.flex.accountingpoint

import arrow.core.Either
import arrow.core.raise.context.bind
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import no.elhub.flex.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.integration.accountingpointadapter.AccountingPointAdapterService
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.error.AppError
import no.elhub.flex.model.error.DataFetchError
import no.elhub.flex.model.error.EndUserError
import no.elhub.flex.model.error.ResourceNotFoundError
import org.koin.core.annotation.Single
import no.elhub.flex.integration.accountingpointadapter.NotFoundError as AdapterNotFoundError
import no.elhub.flex.integration.accountingpointadapter.generated.models.AccountingPoint as AdapterAccountingPoint

interface AccountingPointService {

    /**
     * Synchronizes the accounting point with the given business ID from the adapter,
     * and updates the local database accordingly.
     *
     * @param accountingPointBusinessId the business ID of the accounting point to synchronize.
     * @param validFrom the date from which we will fetch data for the accounting point.
     */
    suspend fun synchronizeAccountingPoint(
        accountingPointBusinessId: String,
        validFrom: LocalDateTime
    ): Either<AppError, Unit>

    /**
     * Returns the end-user ID if the end-user matches the accounting point, or an error if not.
     */
    context(principal: FlexPrincipal)
    suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String
    ): Either<AppError, Int>

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
        validFrom: LocalDateTime
    ): Either<AppError, Unit> {
        val adapterAccountingPoint = fetchAccountingPointData(accountingPointBusinessId, validFrom).mapLeft {
            logger.warn { "Failed to fetch accounting point data for synchronization: ${it.message}" }
        }
        with(FlexPrincipal.internalData()) {
            logger.warn { "SYNC IS NOT IMPLEMENTED YET" }
            return Unit.right()
        }
    }

    context(principal: FlexPrincipal)
    override suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String
    ): Either<AppError, Int> = accountingPointRepository.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId).mapLeft { error ->
        when (error) {
            is NotFoundError -> EndUserError("end user $endUserBusinessId does not match accounting point $accountingPointBusinessId")
            else -> DataFetchError("failed to check end user matches accounting point: ${error.message}")
        }
    }

    context(principal: FlexPrincipal)
    override suspend fun getAccountingPointByBusinessId(
        accountingPointBusinessId: String
    ): Either<AppError, AccountingPoint> = accountingPointRepository.getAccountingPointByBusinessId(accountingPointBusinessId).mapLeft { error ->
        when (error) {
            is NotFoundError -> ResourceNotFoundError("accounting point with business ID $accountingPointBusinessId not found")
            else -> DataFetchError("failed to fetch accounting point: ${error.message}")
        }
    }

    context(principal: FlexPrincipal)
    override suspend fun getCurrentAccountingPoint(controllableUnitBusinessId: String): Either<AppError, AccountingPoint> = accountingPointRepository.getCurrentAccountingPoint(controllableUnitBusinessId).mapLeft { error ->
        when (error) {
            is NotFoundError -> ResourceNotFoundError("accounting point for controllable unit $controllableUnitBusinessId not found")
            else -> DataFetchError("failed to fetch current accounting point: ${error.message}")
        }
    }

    private suspend fun fetchAccountingPointData(
        accountingPointBusinessId: String,
        validFrom: LocalDateTime
    ): Either<DataFetchError, AdapterAccountingPoint> =
        accountingPointAdapter.getAccountingPoint(accountingPointBusinessId, validFrom)
            .mapLeft { err ->
                when (err) {
                    is AdapterNotFoundError -> {
                        logger.info { "Accounting point not found: $accountingPointBusinessId" }
                        DataFetchError("Accounting point $accountingPointBusinessId not found", HttpStatusCode.NotFound)
                    }

                    else -> {
                        logger.warn { "Failed to fetch accounting point $accountingPointBusinessId from adapter: $err" }
                        DataFetchError("Unexpected error", HttpStatusCode.InternalServerError)
                    }
                }
            }
}
