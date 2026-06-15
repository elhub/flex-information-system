package no.elhub.flex.meteringgridarea.db

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.query
import no.elhub.flex.model.domain.MeteringGridArea
import no.elhub.flex.model.domain.MeteringGridAreaStatus
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
import org.koin.core.annotation.Single

interface MeteringGridAreaRepository {
    /**
     * Looks up metering grid areas by their EIC business IDs.
     *
     * Returns a map keyed by business ID containing all requested [MeteringGridArea] entries.
     * Returns an empty map when [businessIds] is empty.
     *
     * Returns [NotFoundError] if any of the requested business IDs is not present in the database.
     */
    context(principal: FlexPrincipal)
    suspend fun getMeteringGridAreasByBusinessIds(
        businessIds: List<String>,
    ): Either<RepositoryError, Map<String, MeteringGridArea>>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class MeteringGridAreaRepositoryImpl : MeteringGridAreaRepository {
    context(principal: FlexPrincipal)
    override suspend fun getMeteringGridAreasByBusinessIds(
        businessIds: List<String>,
    ): Either<RepositoryError, Map<String, MeteringGridArea>> {
        if (businessIds.isEmpty()) return Either.Right(emptyMap())
        return flexTransaction { conn ->
            either {
                val found = runCatching {
                    val pgArray = conn.createArrayOf("text", businessIds.toTypedArray())
                    conn.prepareNamed(
                        "SELECT id, business_id, name, status FROM flex.metering_grid_area WHERE business_id = ANY(:businessIds)",
                        mapOf("businessIds" to pgArray),
                    ).query { rs ->
                        MeteringGridArea(
                            id = rs.getLong("id"),
                            businessId = rs.getString("business_id"),
                            name = rs.getString("name"),
                            status = MeteringGridAreaStatus.valueOf(rs.getString("status").uppercase()),
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "getMeteringGridAreasByBusinessIds failed: ${e.message}" }
                    raise(DatabaseError("Failed to read metering grid areas by business IDs"))
                }

                val foundMap = found.associateBy { it.businessId }
                val missing = businessIds.filter { it !in foundMap }
                if (missing.isNotEmpty()) {
                    raise(NotFoundError("Metering grid areas not found: ${missing.joinToString()}"))
                }
                foundMap
            }
        }
    }
}
