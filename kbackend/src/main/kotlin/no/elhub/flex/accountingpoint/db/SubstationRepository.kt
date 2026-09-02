package no.elhub.flex.accountingpoint.db

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.querySingle
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
import org.koin.core.annotation.Single
import java.util.UUID

interface SubstationRepository {
    /**
     * Looks up a substation's name by its business ID.
     *
     * Returns [NotFoundError] when no row matches.
     */
    context(principal: FlexPrincipal)
    suspend fun getNameByBusinessId(businessId: UUID): Either<RepositoryError, String>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class SubstationRepositoryImpl : SubstationRepository {

    context(principal: FlexPrincipal)
    override suspend fun getNameByBusinessId(businessId: UUID): Either<RepositoryError, String> =
        flexTransaction { conn ->
            either {
                runCatching {
                    conn.prepareNamed(
                        """
                        SELECT name
                        FROM flex.substation
                        WHERE business_id = :businessId
                        """,
                        mapOf("businessId" to businessId.toString()),
                    ).querySingle { rs -> rs.getString("name") }
                }.getOrElse { e ->
                    logger.error { "getNameByBusinessId($businessId) failed: ${e.message}" }
                    raise(DatabaseError("Failed to read substation by business ID $businessId"))
                } ?: run {
                    logger.info { "Substation $businessId not found." }
                    raise(NotFoundError("substation does not exist in database"))
                }
            }
        }
}
