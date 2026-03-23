package no.elhub.flex.controllableunit.db

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.serialization.json.Json
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.model.domain.ControllableUnit
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.RepositoryError
import org.koin.core.annotation.Single

/**
 * Repository interface for controllable units.
 *
 * All functions receive the caller's [FlexPrincipal] via context parameter so
 * implementations can apply the per-request RLS preamble without it being
 * threaded explicitly through every call site.
 */
interface ControllableUnitRepository {

    /**
     * Calls `api.controllable_unit_lookup` and deserialises the returned JSONB array.
     *
     * Returns [RepositoryError] when the query fails.
     */
    context(principal: FlexPrincipal)
    fun lookupControllableUnits(
        controllableUnitBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, List<ControllableUnit>>
}

private val logger = KotlinLogging.logger {}

private val json = Json { ignoreUnknownKeys = true }

@Single(createdAtStart = true)
class ControllableUnitRepositoryImpl : ControllableUnitRepository {

    context(principal: FlexPrincipal)
    override fun lookupControllableUnits(
        controllableUnitBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, List<ControllableUnit>> =
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
                        emptyList<ControllableUnit>().right()
                    } else {
                        runCatching { json.decodeFromString<List<ControllableUnit>>(jsonStr) }.fold(
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
}
