package no.elhub.flex.accountingpoint.db

import arrow.core.Either
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.model.domain.AccountingPointMeteringGridArea
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.util.toSqlTimestampOrNull
import org.koin.core.annotation.Single

interface AccountingPointMeteringGridAreaRepository {
    /**
     * Upserts metering grid area timeline entries for accounting points into
     * flex.accounting_point_metering_grid_area.
     *
     * Matches on (accounting_point_id, lower(valid_time_range)) and updates metering_grid_area_id
     * and valid_time_range when they differ. Inserts new rows when no match is found.
     *
     * Returns [Unit] immediately when [accountingPointMeteringGridAreas] is empty.
     */
    context(principal: FlexPrincipal)
    suspend fun upsertAll(
        accountingPointMeteringGridAreas: List<AccountingPointMeteringGridArea>,
    ): Either<RepositoryError, Unit>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class AccountingPointMeteringGridAreaRepositoryImpl : AccountingPointMeteringGridAreaRepository {
    context(principal: FlexPrincipal)
    override suspend fun upsertAll(
        accountingPointMeteringGridAreas: List<AccountingPointMeteringGridArea>,
    ): Either<RepositoryError, Unit> {
        if (accountingPointMeteringGridAreas.isEmpty()) return Unit.right()
        return flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    MERGE INTO flex.accounting_point_metering_grid_area AS apmga
                    USING (
                        SELECT
                            unnest(:accountingPointId::bigint[])  AS accounting_point_id,
                            unnest(:meteringGridAreaId::bigint[]) AS metering_grid_area_id,
                            unnest(:validFrom::timestamptz[])     AS valid_from,
                            unnest(:validTo::timestamptz[])       AS valid_to
                    ) AS src
                    ON (
                        apmga.accounting_point_id = src.accounting_point_id
                        AND lower(apmga.valid_time_range) = src.valid_from
                    )
                    WHEN MATCHED AND (
                        apmga.metering_grid_area_id IS DISTINCT FROM src.metering_grid_area_id
                        OR upper(apmga.valid_time_range) IS DISTINCT FROM src.valid_to
                    ) THEN UPDATE SET
                        metering_grid_area_id = src.metering_grid_area_id,
                        valid_time_range      = tstzrange(src.valid_from, src.valid_to, '[)')
                    WHEN NOT MATCHED
                    THEN INSERT (accounting_point_id, metering_grid_area_id, valid_time_range)
                    VALUES (src.accounting_point_id, src.metering_grid_area_id, tstzrange(src.valid_from, src.valid_to, '[)'))
                    """,
                    accountingPointMeteringGridAreas.map { mga ->
                        mapOf(
                            "accountingPointId" to mga.accountingPointId,
                            "meteringGridAreaId" to mga.meteringGridAreaId,
                            "validFrom" to mga.validFrom.toSqlTimestampOrNull(),
                            "validTo" to mga.validTo.toSqlTimestampOrNull(),
                        )
                    },
                ).use { stmt -> stmt.execute() }
                Unit
            }.mapLeft { e ->
                logger.error { "upsertAll AccountingPointMeteringGridArea failed: ${e.message}" }
                DatabaseError("Failed to upsert accounting point metering grid areas")
            }
        }
    }
}
