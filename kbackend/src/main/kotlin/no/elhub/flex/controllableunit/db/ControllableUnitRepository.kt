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
import no.elhub.flex.model.domain.ControllableUnit
import no.elhub.flex.model.domain.ControllableUnitForLookup
import no.elhub.flex.model.domain.ControllableUnitStatus
import no.elhub.flex.model.domain.RegulationDirection
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.util.createBigintArray
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
     * Retrieves all controllable units associated with either the given [controllableUnitBusinessId] or the given
     * [accountingPointBusinessId].
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
     * Retrieves the earliest CU start date per accounting point for the given IDs.
     *
     * Accounting points with no CUs or only NULL start dates are omitted from the result.
     *
     * Returns [DatabaseError] if the query fails.
     *
     * @param accountingPointIds the internal IDs of the accounting points to query.
     */
    context(principal: FlexPrincipal)
    suspend fun getEarliestStartDateByAccountingPointIds(
        accountingPointIds: List<Long>,
    ): Either<DatabaseError, Map<AccountingPointId, LocalDate>>
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
    override suspend fun getEarliestStartDateByAccountingPointIds(
        accountingPointIds: List<Long>,
    ): Either<DatabaseError, Map<AccountingPointId, LocalDate>> = flexTransaction { conn ->
        Either.catch {
            conn.prepareNamed(
                """
                SELECT accounting_point_id, MIN(start_date) AS earliest_start_date
                FROM flex.controllable_unit
                WHERE accounting_point_id = ANY(:accountingPointIds)
                  AND start_date IS NOT NULL
                GROUP BY accounting_point_id
                """.trimIndent(),
                mapOf("accountingPointIds" to conn.createBigintArray(accountingPointIds))
            ).query { rs ->
                AccountingPointId(rs.getLong("accounting_point_id")) to
                    rs.getDate("earliest_start_date").toLocalDate().toKotlinLocalDate()
            }.toMap()
        }.mapLeft { e ->
            logger.error { "getEarliestStartDateByAccountingPointIds failed: ${e.message}" }
            DatabaseError("Failed to query earliest start dates by accounting point ids")
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
