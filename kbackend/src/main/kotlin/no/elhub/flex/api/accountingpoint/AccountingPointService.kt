package no.elhub.flex.api.accountingpoint

import arrow.core.Either
import no.elhub.flex.api.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.shared.accountingpoint.model.AccountingPoint
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.NoMatchError
import no.elhub.flex.shared.db.NotFoundError
import no.elhub.flex.shared.http.AppError
import no.elhub.flex.shared.http.EndUserError
import no.elhub.flex.shared.http.InternalServerError
import no.elhub.flex.shared.http.ResourceNotFoundError
import no.elhub.flex.shared.tracing.TraceIdUtil.Companion.traceIdOrUnknown
import org.koin.core.annotation.Single

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
}

@Single(createdAtStart = true)
class AccountingPointServiceImpl(
    private val accountingPointRepository: AccountingPointRepository,
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
}
