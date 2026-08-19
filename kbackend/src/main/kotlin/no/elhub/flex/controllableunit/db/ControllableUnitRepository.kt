package no.elhub.flex.controllableunit.db

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.datetime.LocalDate
import kotlinx.datetime.toKotlinLocalDate
import kotlinx.serialization.json.Json
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.query
import no.elhub.flex.model.domain.AccountingPointId
import no.elhub.flex.model.domain.AccountingPointStart
import no.elhub.flex.model.domain.ControllableUnit
import no.elhub.flex.model.domain.ControllableUnitForLookup
import no.elhub.flex.model.domain.ControllableUnitStatus
import no.elhub.flex.model.domain.RegulationDirection
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.util.createBigintArray
import no.elhub.flex.util.toKotlinInstantOrNull
import org.koin.core.annotation.Single
import java.sql.ResultSet

/**
 * Repository interface for controllable units.
 *
 * All functions receive the caller's [FlexPrincipal] via context parameter so
 * implementations can apply the per-request RLS preamble without it being
 * threaded explicitly through every call site.
 */
interface ControllableUnitRepository {

    /**
     * Retrieves all non-terminated controllable units associated with either the given [controllableUnitBusinessId]
     * or the given [accountingPointBusinessId].
     *
     * Returns [RepositoryError] when the query fails.
     */
    context(principal: FlexPrincipal)
    suspend fun lookupControllableUnits(
        controllableUnitBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, List<ControllableUnitForLookup>>

    /**
     * Retrieves all controllable units associated with the given accounting point.
     *
     * Returns [DatabaseError] if the query fails.
     *
     * @param accountingPointId the internal ID of the accounting point.
     */
    context(principal: FlexPrincipal)
    suspend fun getByAccountingPointId(accountingPointId: Long): Either<DatabaseError, List<ControllableUnit>>

    /**
     * Gets the earliest start date of controllable units and their service provider contracts behind the given
     * accounting points in the system.
     *
     * @param accountingPointIds the internal IDs of the accounting points whose data we want to get
     */
    context(principal: FlexPrincipal)
    suspend fun getAccountingPointStarts(accountingPointIds: List<Long>): Either<RepositoryError, Map<AccountingPointId, AccountingPointStart>>
}

private val logger = KotlinLogging.logger {}

private val json = Json { ignoreUnknownKeys = true }

@Single(createdAtStart = true)
class ControllableUnitRepositoryImpl : ControllableUnitRepository {

    context(principal: FlexPrincipal)
    override suspend fun lookupControllableUnits(
        controllableUnitBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, List<ControllableUnitForLookup>> =
        flexTransaction { conn ->
            runCatching {
                conn.prepareStatement(GET_BY_CU_OR_AP_BUSINESS_ID)
                    .use { stmt ->
                        stmt.setString(1, controllableUnitBusinessId)
                        stmt.setString(2, accountingPointBusinessId)
                        stmt.executeQuery().use { rs -> if (rs.next()) rs.getString(1) else null }
                    }
            }.fold(
                onSuccess = { jsonStr ->
                    if (jsonStr == null) {
                        emptyList<ControllableUnitForLookup>().right()
                    } else {
                        logger.debug { "Raw lookup query result: $jsonStr" }
                        runCatching { json.decodeFromString<List<ControllableUnitForLookup>>(jsonStr) }.fold(
                            onSuccess = { it.right() },
                            onFailure = { e ->
                                DatabaseError("failed to parse CU lookup result: ${e.message}").left()
                            },
                        )
                    }
                },
                onFailure = { e ->
                    logger.error { "lookupControllableUnits failed: ${e.message}" }
                    DatabaseError("controllable unit lookup query failed: ${e.message}").left()
                },
            )
        }

    context(principal: FlexPrincipal)
    override suspend fun getByAccountingPointId(
        accountingPointId: Long
    ): Either<DatabaseError, List<ControllableUnit>> = flexTransaction { conn ->
        Either.catch {
            conn.prepareNamed(
                """
                SELECT *
                FROM flex.controllable_unit
                WHERE accounting_point_id = :accountingPointId
                """.trimIndent(),
                mapOf("accountingPointId" to accountingPointId)
            ).query { it.toControllableUnit() }
        }.mapLeft { e ->
            logger.error { "getByAccountingPointId failed: ${e.message}" }
            DatabaseError("Failed to query  by accounting point id")
        }
    }

    context(principal: FlexPrincipal)
    override suspend fun getAccountingPointStarts(accountingPointIds: List<Long>): Either<RepositoryError, Map<AccountingPointId, AccountingPointStart>> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    SELECT
                        cu.accounting_point_id,
                        MIN(cu.start_date)::timestamp AT TIME ZONE 'Europe/Oslo'
                            AS controllable_unit_start_time,
                        MIN(LOWER(cusp.valid_time_range))
                            AS controllable_unit_service_provider_valid_time_start
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
                        AccountingPointStart(
                            accountingPointId = accountingPointId,
                            controllableUnitStartTime = rs.getTimestamp("controllable_unit_start_time").toKotlinInstantOrNull(),
                            controllableUnitServiceProviderValidTimeStart = rs.getTimestamp("controllable_unit_service_provider_valid_time_start").toKotlinInstantOrNull(),
                        )
                }.toMap()
            }.mapLeft { e ->
                logger.error { "getAccountingPointStarts failed: ${e.message}" }
                DatabaseError("Failed to read accounting point starts")
            }
        }

    private fun ResultSet.toControllableUnit(): ControllableUnit = ControllableUnit(
        id = getLong("id"),
        businessId = getString("business_id"),
        name = getString("name"),
        startDate = getDate("start_date")?.toLocalDate()?.toKotlinLocalDate(),
        status = ControllableUnitStatus.fromValue(getString("status")),
        regulationDirection = RegulationDirection.fromValue(getString("regulation_direction")),
        maximumActivePower = getBigDecimal("maximum_active_power"),
        isSmall = getBoolean("is_small"),
        additionalInformation = getString("additional_information"),
        accountingPointId = getLong("accounting_point_id"),
        createdByPartyId = getLong("created_by_party_id")
    )
}
