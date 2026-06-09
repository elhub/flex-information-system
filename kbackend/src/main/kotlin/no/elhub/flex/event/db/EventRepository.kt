package no.elhub.flex.event.db

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.RepositoryError
import org.koin.core.annotation.Single

/**
 * Repository for events.
 *
 * All functions receive the caller's [FlexPrincipal] via context parameter so
 * implementations can apply the per-request RLS preamble without it being
 * threaded explicitly through every call site.
 */
interface EventRepository {

    /** Inserts an event in the database. */
    context(principal: FlexPrincipal)
    suspend fun insertEvent(
        type: String,
        source: String,
        sourceId: Long,
        subjectResource: String?,
        subjectId: Long?,
        data: String?,
    ): Either<RepositoryError, Unit>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class EventRepositoryImpl : EventRepository {

    context(principal: FlexPrincipal)
    override suspend fun insertEvent(
        type: String,
        source: String,
        sourceId: Long,
        subjectResource: String?,
        subjectId: Long?,
        data: String?,
    ): Either<RepositoryError, Unit> = flexTransaction { conn ->
        runCatching {
            conn.prepareNamed(
                """
            INSERT INTO flex.event (type, source_resource, source_id, subject_resource, subject_id, data)
            SELECT
                public.text2ltree(:type),
                :source,
                :sourceId,
                :subjectResource,
                :subjectId,
                :data::jsonb
            """,
                mapOf(
                    "type" to type,
                    "source" to source,
                    "sourceId" to sourceId,
                    "subjectResource" to subjectResource,
                    "subjectId" to subjectId,
                    "data" to data,
                ),
            ).use { it.execute() }
        }.fold(
            onSuccess = { Unit.right() },
            onFailure = { e ->
                logger.error { "insertEvent failed: ${e.message}" }
                DatabaseError("failed to insert event: ${e.message}").left()
            },
        )
    }
}
