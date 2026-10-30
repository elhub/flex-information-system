package no.elhub.flex.api.accountingpoint.db

import arrow.core.Either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.query
import org.koin.core.annotation.Single

interface AccountingPointSyncRepository {
    context(principal: FlexPrincipal)
    suspend fun getBatchForSync(batchSize: Int): Either<RepositoryError, List<Long>>
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

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
