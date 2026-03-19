package no.elhub.flex.controllableunit.db

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.serialization.json.Json
import no.elhub.flex.auth.AccessToken
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.ControllableUnit
import org.koin.core.annotation.Single

private val logger = KotlinLogging.logger {}

private val json = Json { ignoreUnknownKeys = true }

@Single(createdAtStart = true)
class ControllableUnitRepositoryImpl : ControllableUnitRepository {

    context(token: AccessToken)
    override fun getCurrentAccountingPoint(
        controllableUnitBusinessId: String,
    ): Either<RepositoryError, AccountingPoint> =
        flexTransaction(token.role, token.extId) { conn ->
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
                    logger.debug { "getCurrentAccountingPoint failed: ${e.message}" }
                    NotFoundError("controllable unit does not exist").left()
                },
            )
        }

    context(token: AccessToken)
    override fun getAccountingPointIdByBusinessId(
        accountingPointBusinessId: String,
    ): Either<RepositoryError, Int> =
        flexTransaction(token.role, token.extId) { conn ->
            runCatching {
                conn.prepareStatement(
                    "SELECT id FROM api.accounting_point WHERE business_id = ?",
                ).use { stmt ->
                    stmt.setString(1, accountingPointBusinessId)
                    stmt.executeQuery().use { rs -> if (rs.next()) rs.getInt(1) else null }
                }
            }.fold(
                onSuccess = { id ->
                    id?.right() ?: NotFoundError("accounting point does not exist in database").left()
                },
                onFailure = { e ->
                    logger.debug { "getAccountingPointIdByBusinessId failed: ${e.message}" }
                    NotFoundError("accounting point does not exist in database").left()
                },
            )
        }

    context(token: AccessToken)
    override fun upsertAccountingPoint(
        accountingPointBusinessId: String,
        meteringGridAreaBusinessId: String,
        endUserBusinessId: String,
    ): Either<RepositoryError, Int> =
        flexTransaction(token.role, token.extId) { conn ->
            runCatching {
                conn.prepareStatement(
                    """
                    SELECT accounting_point_id::bigint
                    FROM api.controllable_unit_lookup_sync_accounting_point(?::text, ?::text, ?::text)
                    """.trimIndent(),
                ).use { stmt ->
                    stmt.setString(1, accountingPointBusinessId)
                    stmt.setString(2, meteringGridAreaBusinessId)
                    stmt.setString(3, endUserBusinessId)
                    stmt.executeQuery().use { rs -> if (rs.next()) rs.getInt(1) else null }
                }
            }.fold(
                onSuccess = { id ->
                    id?.right() ?: DatabaseError("accounting point sync returned no result").left()
                },
                onFailure = { e ->
                    logger.error { "syncAccountingPoint failed: ${e.message}" }
                    DatabaseError("failed accounting point sync: ${e.message}").left()
                },
            )
        }

    context(token: AccessToken)
    override fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, Int> =
        flexTransaction(token.role, token.extId) { conn ->
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
                    logger.debug { "checkEndUserMatchesAccountingPoint failed: ${e.message}" }
                    NotFoundError("end user does not match accounting point / controllable unit").left()
                },
            )
        }

    context(token: AccessToken)
    override fun lookupControllableUnits(
        controllableUnitBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, List<ControllableUnit>> =
        flexTransaction(token.role, token.extId) { conn ->
            runCatching {
                conn.prepareStatement(
                    """
                    SELECT controllable_units::jsonb
                    FROM api.controllable_unit_lookup(
                        nullif(?::text, ''),
                        nullif(?::text, '')
                    )
                    """.trimIndent(),
                ).use { stmt ->
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
