package no.elhub.flex.controllableunit.db

import arrow.core.Either
import no.elhub.flex.auth.AccessToken
import no.elhub.flex.controllableunit.dto.ControllableUnit
import no.elhub.flex.domain.AccountingPoint

/** Database errors raised by [ControllableUnitRepository]. */
sealed class RepositoryError(val message: String)

data class NotFoundError(val detail: String) : RepositoryError(detail)
data class DatabaseError(val detail: String) : RepositoryError(detail)

/**
 * Repository interface for the controllable-unit lookup flow.
 *
 * All functions receive the caller's [AccessToken] via context parameter so
 * implementations can apply the per-request RLS preamble without it being
 * threaded explicitly through every call site.
 */
interface ControllableUnitRepository {

    /**
     * Calls `api.current_controllable_unit_accounting_point($controllableUnitBusinessId)`.
     *
     * Returns an [AccountingPoint] or [NotFoundError] when the controllable unit does not exist.
     */
    context(token: AccessToken)
    fun getCurrentAccountingPoint(controllableUnitBusinessId: String): Either<RepositoryError, AccountingPoint>

    /**
     * Looks up an accounting point ID by its business ID from `api.accounting_point`.
     *
     * Returns [NotFoundError] when no row matches.
     */
    context(token: AccessToken)
    fun getAccountingPointIdByBusinessId(accountingPointBusinessId: String): Either<RepositoryError, Int>

    /**
     * Calls `api.controllable_unit_lookup_sync_accounting_point`.
     *
     * Returns the newly-synced accounting point ID, or [DatabaseError] on failure.
     */
    context(token: AccessToken)
    fun upsertAccountingPointMeteringGridArea(
        accountingPointBusinessId: String,
        meteringGridAreaBusinessId: String,
        endUserBusinessId: String,
    ): Either<RepositoryError, Int>

    /**
     * Calls `api.controllable_unit_lookup_check_end_user_matches_accounting_point`.
     *
     * Returns the end-user ID, or [NotFoundError] when the check fails.
     */
    context(token: AccessToken)
    fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, Int>

    /**
     * Calls `api.controllable_unit_lookup` and deserialises the returned JSONB array.
     *
     * Returns [DatabaseError] when the query fails.
     */
    context(token: AccessToken)
    fun lookupControllableUnits(
        controllableUnitBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, List<ControllableUnit>>
}
