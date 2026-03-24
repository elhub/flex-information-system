package no.elhub.flex.accountingpoint.db

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
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
     * Returns the end-user ID, or [NotFoundError] when the check fails.
     */
    context(principal: FlexPrincipal)
    suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String
    ): Either<RepositoryError, Int>
}

@Single(createdAtStart = true)
class AccountingPointRepositoryImpl : AccountingPointRepository {

    private val logger = KotlinLogging.logger {}

    context(principal: FlexPrincipal)
    override suspend fun getCurrentAccountingPoint(
        controllableUnitBusinessId: String,
    ): Either<RepositoryError, AccountingPoint> =
        flexTransaction { conn ->
            runCatching {
                conn.prepareStatement(
                    """
                    SELECT accounting_point_id::bigint, accounting_point_business_id::text
                    FROM api.current_controllable_unit_accounting_point(?::text)
                    """.trimIndent(),
                ).use { stmt ->
                    stmt.setString(1, controllableUnitBusinessId)
                    stmt.executeQuery().use { rs ->
                        if (rs.next()) AccountingPoint(id = rs.getInt(1), businessId = rs.getString(2)) else null
                    }
                }
            }.fold(
                onSuccess = { row ->
                    row?.right() ?: NotFoundError("controllable unit does not exist").left()
                },
                onFailure = { e ->
                    logger.error { "getCurrentAccountingPoint failed: ${e.message}" }
                    DatabaseError("Failed to read Accounting Point data").left()
                },
            )
        }

    context(principal: FlexPrincipal)
    override suspend fun getAccountingPointByBusinessId(
        accountingPointBusinessId: String,
    ): Either<RepositoryError, AccountingPoint> =
        flexTransaction { conn ->
            runCatching {
                conn.prepareStatement(
                    "SELECT id, business_id FROM flex.accounting_point WHERE business_id = ?",
                ).use { stmt ->
                    stmt.setString(1, accountingPointBusinessId)
                    stmt.executeQuery().use { rs ->
                        if (rs.next()) AccountingPoint(id = rs.getInt(1), businessId = rs.getString(2)) else null
                    }
                }
            }.fold(
                onSuccess = { id ->
                    id?.right() ?: NotFoundError("accounting point does not exist in database").left()
                },
                onFailure = { e ->
                    logger.error { "getAccountingPointIdByBusinessId failed: ${e.message}" }
                    DatabaseError("accounting point does not exist in database").left()
                },
            )
        }

    context(principal: FlexPrincipal)
    override suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, Int> =
        flexTransaction { conn ->
            runCatching {
                conn.prepareStatement(
                    """
                    SELECT end_user_id::bigint
                    FROM api.controllable_unit_lookup_check_end_user_matches_accounting_point(?::text, ?::text)
                    """.trimIndent(),
                ).use { stmt ->
                    stmt.setString(1, endUserBusinessId)
                    stmt.setString(2, accountingPointBusinessId)
                    stmt.executeQuery().use { rs -> if (rs.next()) rs.getInt(1) else null }
                }
            }.fold(
                onSuccess = { id ->
                    id?.right()
                        ?: NotFoundError("end user does not match accounting point / controllable unit").left()
                },
                onFailure = { e ->
                    logger.error { "checkEndUserMatchesAccountingPoint failed: ${e.message}" }
                    DatabaseError("end user does not match accounting point / controllable unit").left()
                },
            )
        }
}
