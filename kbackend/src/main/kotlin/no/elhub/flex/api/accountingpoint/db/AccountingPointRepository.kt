package no.elhub.flex.api.accountingpoint.db

import arrow.core.Either
import arrow.core.flatMap
import arrow.core.left
import arrow.core.raise.either
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.shared.accountingpoint.model.AccountingPoint
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.NoMatchError
import no.elhub.flex.shared.db.NotFoundError
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.createBigintArray
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.query
import no.elhub.flex.shared.db.querySingle
import org.koin.core.annotation.Single

interface AccountingPointRepository {
    /**
     * Calls `api.current_controllable_unit_accounting_point($controllableUnitBusinessId)`.
     *
     * Returns an [AccountingPoint] or [NotFoundError] when the controllable unit does not exist.
     */
    context(principal: FlexPrincipal)
    suspend fun getCurrentAccountingPoint(
        controllableUnitBusinessId: String
    ): Either<RepositoryError, AccountingPoint>

    /**
     * Looks up an accounting point by its business ID.
     *
     * Returns [NotFoundError] when no row matches.
     */
    context(principal: FlexPrincipal)
    suspend fun getAccountingPointByBusinessId(
        accountingPointBusinessId: String
    ): Either<RepositoryError, AccountingPoint>

    /**
     * Calls `api.controllable_unit_lookup_check_end_user_matches_accounting_point`.
     *
     * Returns the end-user ID, or [NoMatchError] when the check fails.
     */
    context(principal: FlexPrincipal)
    suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String
    ): Either<RepositoryError, Long>

    /**
     * Retrieves accounting points by their internal IDs.
     *
     * IDs with no matching row are silently omitted from the result.
     *
     * Returns [DatabaseError] if the query fails.
     *
     * @param accountingPointIds the internal IDs of the accounting points to retrieve.
     */
    context(principal: FlexPrincipal)
    suspend fun getByIds(accountingPointIds: List<Long>): Either<RepositoryError, List<AccountingPoint>>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class AccountingPointRepositoryImpl : AccountingPointRepository {

    context(principal: FlexPrincipal)
    override suspend fun getCurrentAccountingPoint(
        controllableUnitBusinessId: String,
    ): Either<RepositoryError, AccountingPoint> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        """
                        SELECT accounting_point_id::bigint, accounting_point_business_id::text
                        FROM api.current_controllable_unit_accounting_point(:controllableUnitBusinessId::text)
                        """,
                        mapOf("controllableUnitBusinessId" to controllableUnitBusinessId),
                    ).querySingle { rs ->
                        AccountingPoint(
                            id = rs.getLong("accounting_point_id"),
                            businessId = rs.getString("accounting_point_business_id")
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "getCurrentAccountingPoint failed: ${e.message}" }
                    raise(DatabaseError("Failed to read Accounting Point data"))
                }

                row ?: run {
                    logger.info { "Current AP not found for CU $controllableUnitBusinessId." }
                    raise(NotFoundError("Current accounting point not found"))
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun getAccountingPointByBusinessId(
        accountingPointBusinessId: String,
    ): Either<RepositoryError, AccountingPoint> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        "SELECT id, business_id FROM flex.accounting_point WHERE business_id = :businessId",
                        mapOf("businessId" to accountingPointBusinessId),
                    ).querySingle { rs ->
                        AccountingPoint(
                            id = rs.getLong("id"),
                            businessId = rs.getString("business_id")
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "getAccountingPointIdByBusinessId($accountingPointBusinessId) failed: ${e.message}" }
                    raise(DatabaseError("Failed to read accounting point by business ID $accountingPointBusinessId"))
                }

                row ?: run {
                    logger.info { "Accounting point $accountingPointBusinessId not found." }
                    raise(NotFoundError("accounting point does not exist in database"))
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, Long> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    SELECT end_user_id::bigint
                    FROM api.controllable_unit_lookup_check_end_user_matches_accounting_point(
                        :endUserBusinessId::text,
                        :accountingPointBusinessId::text
                    )
                    """,
                    mapOf(
                        "endUserBusinessId" to endUserBusinessId,
                        "accountingPointBusinessId" to accountingPointBusinessId,
                    ),
                ).querySingle { rs -> rs.getLong("end_user_id") }
            }.mapLeft { e ->
                logger.error { "checkEndUserMatchesAccountingPoint failed: ${e.message}" }
                DatabaseError("Failed to check end user")
            }.flatMap { id ->
                id?.right() ?: run {
                    logger.info { "No match between end user and accounting point $accountingPointBusinessId" }
                    NoMatchError("End user does not match accounting point / controllable unit").left()
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun getByIds(accountingPointIds: List<Long>): Either<RepositoryError, List<AccountingPoint>> =
        flexTransaction { conn ->
            Either.catch {
                val ids = conn.createBigintArray(accountingPointIds)
                conn.prepareNamed(
                    "SELECT id, business_id FROM flex.accounting_point WHERE id = ANY(:accountingPointIds)",
                    mapOf("accountingPointIds" to ids)
                ).query { rs ->
                    AccountingPoint(
                        id = rs.getLong("id"),
                        businessId = rs.getString("business_id")
                    )
                }
            }.mapLeft { e ->
                logger.error { "getByIds failed: ${e.message}" }
                DatabaseError("Failed to read accounting points by ids")
            }
        }
}
