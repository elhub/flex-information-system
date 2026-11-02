package no.elhub.flex.api.accountingpoint

import arrow.core.Either
import no.elhub.flex.api.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.shared.accountingpoint.model.AccountingPoint
import no.elhub.flex.shared.accountingpoint.model.AccountingPointId
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.NoMatchError
import no.elhub.flex.shared.db.NotFoundError
import no.elhub.flex.shared.error.AppError
import no.elhub.flex.shared.error.EndUserError
import no.elhub.flex.shared.error.InternalServerError
import no.elhub.flex.shared.error.ResourceNotFoundError
import no.elhub.flex.shared.util.TraceIdUtil.Companion.traceIdOrUnknown
import org.koin.core.annotation.Single
import kotlin.time.Instant
import no.elhub.flex.shared.accountingpoint.AccountingPointService as SharedAccountingPointService

interface AccountingPointService {

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

    /**
     * Retrieves accounting points by their internal IDs.
     *
     * IDs with no matching row are silently omitted from the result.
     *
     * Returns [InternalServerError] if the query fails.
     *
     * @param accountingPointIds the internal IDs of the accounting points to retrieve.
     */
    context(principal: FlexPrincipal)
    suspend fun getByIds(accountingPointIds: List<Long>): Either<AppError, List<AccountingPoint>>

    /**
     * Gets the earliest date from which we have active data about an accounting point in the system.
     */
    context(principal: FlexPrincipal)
    suspend fun getAccountingPointStartDate(accountingPointId: Long): Either<AppError, Instant?>
}

@Single(createdAtStart = true)
class AccountingPointServiceImpl(
    private val accountingPointRepository: AccountingPointRepository,
    private val sharedAccountingPointService: SharedAccountingPointService,
) : AccountingPointService {

    context(principal: FlexPrincipal)
    override suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String
    ): Either<AppError, Long> = accountingPointRepository.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId).mapLeft { error ->
        when (error) {
            is NoMatchError -> EndUserError("End user does not match")
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

    context(principal: FlexPrincipal)
    override suspend fun getByIds(accountingPointIds: List<Long>): Either<AppError, List<AccountingPoint>> =
        accountingPointRepository.getByIds(accountingPointIds)
            .mapLeft { InternalServerError(traceIdOrUnknown()) }

    context(principal: FlexPrincipal)
    override suspend fun getAccountingPointStartDate(accountingPointId: Long): Either<AppError, Instant?> =
        sharedAccountingPointService.getAccountingPointStartDates(listOf(accountingPointId)).map { it[AccountingPointId(accountingPointId)] }
}
