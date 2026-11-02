package no.elhub.flex.shared.accountingpoint.db

import arrow.core.Either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.shared.accountingpoint.model.AccountingPointId
import no.elhub.flex.shared.accountingpoint.model.AccountingPointStartDates
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.createBigintArray
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.query
import no.elhub.flex.shared.util.toKotlinInstantOrNull
import org.koin.core.annotation.Single

interface AccountingPointStartDatesRepository {

    /**
     * Gets the earliest start date of controllable units and their service provider contracts behind the given
     * accounting points in the system.
     *
     * @param accountingPointIds the internal IDs of the accounting points whose data we want to get
     */
    context(principal: FlexPrincipal)
    suspend fun getAccountingPointStartDates(accountingPointIds: List<Long>): Either<RepositoryError, Map<AccountingPointId, AccountingPointStartDates>>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class AccountingPointStartDatesRepositoryImpl : AccountingPointStartDatesRepository {

    context(principal: FlexPrincipal)
    override suspend fun getAccountingPointStartDates(accountingPointIds: List<Long>): Either<RepositoryError, Map<AccountingPointId, AccountingPointStartDates>> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    SELECT
                        cu.accounting_point_id,
                        MIN(cu.start_date)::timestamp AS controllable_unit_start_time,
                        MIN(LOWER(cusp.valid_time_range)) AS controllable_unit_service_provider_valid_time_start
                    FROM flex.controllable_unit AS cu
                        LEFT JOIN flex.controllable_unit_service_provider AS cusp
                            ON cu.id = cusp.controllable_unit_id
                    WHERE cu.accounting_point_id = ANY(:accountingPointIds)
                    GROUP BY cu.accounting_point_id
                    """.trimIndent(),
                    mapOf("accountingPointIds" to conn.createBigintArray(accountingPointIds))
                ).query { rs ->
                    val accountingPointId = rs.getLong("accounting_point_id")
                    AccountingPointId(accountingPointId) to
                        AccountingPointStartDates(
                            controllableUnitStartTime = rs.getTimestamp("controllable_unit_start_time").toKotlinInstantOrNull(),
                            controllableUnitServiceProviderValidTimeStart = rs.getTimestamp("controllable_unit_service_provider_valid_time_start").toKotlinInstantOrNull(),
                        )
                }.toMap()
            }.mapLeft { e ->
                logger.error { "getAccountingPointStarts failed: ${e.message}" }
                DatabaseError("Failed to read accounting point starts")
            }
        }
}
