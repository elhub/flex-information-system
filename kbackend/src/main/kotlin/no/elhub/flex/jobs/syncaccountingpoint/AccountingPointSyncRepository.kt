package no.elhub.flex.jobs.syncaccountingpoint

import arrow.core.Either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.shared.accountingpoint.model.AccountingPoint
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.createBigintArray
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.query
import org.koin.core.annotation.Single

interface AccountingPointSyncRepository {
    context(principal: FlexPrincipal)
    suspend fun getBatchForSync(batchSize: Int): Either<RepositoryError, List<Long>>

    /**
     * Retrieves accounting points by their internal IDs.
     *
     * IDs with no matching row are silently omitted from the result.
     */
    context(principal: FlexPrincipal)
    suspend fun getByIds(accountingPointIds: List<Long>): Either<RepositoryError, List<AccountingPoint>>
}

@Single(createdAtStart = true)
class AccountingPointSyncRepositoryImpl : AccountingPointSyncRepository {
    context(principal: FlexPrincipal)
    override suspend fun getBatchForSync(batchSize: Int): Either<RepositoryError, List<Long>> = flexTransaction { conn ->
        Either.catch {
            conn.prepareNamed(
                """
                WITH batch AS (
                    SELECT accounting_point_id
                    FROM flex.accounting_point_sync
                    WHERE (last_synced_at IS NULL OR last_synced_at < NOW() - INTERVAL '23 hours')
                      AND (last_sync_start IS NULL OR last_sync_start < NOW() - INTERVAL '1 hour')
                    ORDER BY last_sync_start, last_synced_at
                    LIMIT :batchSize
                    FOR UPDATE SKIP LOCKED
                )
                UPDATE flex.accounting_point_sync
                SET last_sync_start = NOW()
                FROM batch
                WHERE flex.accounting_point_sync.accounting_point_id = batch.accounting_point_id
                RETURNING flex.accounting_point_sync.accounting_point_id
                """.trimIndent(),
                mapOf("batchSize" to batchSize)
            ).query { it.getLong("accounting_point_id") }
        }.mapLeft { e ->
            logger.error { "getBatchForSync failed: ${e.message}" }
            DatabaseError("Failed to query accounting point sync batch")
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

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
