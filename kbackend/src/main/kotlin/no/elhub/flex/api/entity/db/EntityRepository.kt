package no.elhub.flex.api.entity.db

import arrow.core.Either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import org.koin.core.annotation.Single

/** The result of looking up an entity: its ID and whether it existed already. */
data class EntityLookupResult(val entityId: Long, val found: Boolean)

/**
 * Repository interface for entities.
 *
 * All functions receive the caller's [FlexPrincipal] via context parameter so
 * implementations can apply the per-request RLS preamble.
 */
interface EntityRepository {

    /**
     * Finds the entity with the given business ID, or creates it if missing.
     *
     * Returns [DatabaseError] if the query fails.
     */
    context(principal: FlexPrincipal)
    suspend fun lookup(
        businessId: String,
        name: String,
        type: String,
        businessIdType: String,
    ): Either<DatabaseError, EntityLookupResult>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class EntityRepositoryImpl : EntityRepository {

    context(principal: FlexPrincipal)
    override suspend fun lookup(
        businessId: String,
        name: String,
        type: String,
        businessIdType: String,
    ): Either<DatabaseError, EntityLookupResult> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareStatement(
                    "SELECT entity_id::bigint, entity_found::boolean FROM api.entity_lookup(?, ?, ?, ?)",
                ).use { stmt ->
                    stmt.setString(1, businessId)
                    stmt.setString(2, name)
                    stmt.setString(3, type)
                    stmt.setString(4, businessIdType)
                    stmt.executeQuery().use { rs ->
                        check(rs.next()) { "entity_lookup returned no row" }
                        EntityLookupResult(entityId = rs.getLong(1), found = rs.getBoolean(2))
                    }
                }
            }.mapLeft { e ->
                logger.error(e) { "entity lookup failed" }
                DatabaseError("entity lookup query failed: ${e.message}")
            }
        }
}
