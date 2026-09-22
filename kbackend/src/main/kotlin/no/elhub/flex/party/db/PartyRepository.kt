package no.elhub.flex.party.db

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.querySingle
import no.elhub.flex.model.domain.Party
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
import org.koin.core.annotation.Single

interface PartyRepository {
    /**
     * Looks up a party by its internal ID.
     *
     * Returns [NotFoundError] when no row matches.
     */
    context(principal: FlexPrincipal)
    suspend fun getById(partyId: Long): Either<RepositoryError, Party>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class PartyRepositoryImpl : PartyRepository {

    context(principal: FlexPrincipal)
    override suspend fun getById(partyId: Long): Either<RepositoryError, Party> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        "SELECT id, name, role, business_id FROM flex.party WHERE id = :partyId",
                        mapOf("partyId" to partyId),
                    ).querySingle { rs ->
                        Party(
                            id = rs.getLong("id"),
                            name = rs.getString("name"),
                            role = rs.getString("role"),
                            businessId = rs.getString("business_id"),
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "getById($partyId) failed: ${e.message}" }
                    raise(DatabaseError("Failed to read party by id $partyId"))
                }

                row ?: run {
                    logger.info { "Party $partyId not found." }
                    raise(NotFoundError("party does not exist in database"))
                }
            }
        }
}
