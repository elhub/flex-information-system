package no.elhub.flex.jobs.eventworker

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.createBigintArray
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.query
import no.elhub.flex.shared.db.queryRequiredSingle
import org.koin.core.annotation.Single
import java.time.OffsetDateTime

/**
 * An event from the `notification.event` outbox.
 *
 * @property type the reverse DNS style type, e.g. `no.elhub.flex.controllable_unit.create`
 * @property sourceId the ID of the resource the event is about
 * @property subjectId the ID of the resource impacted, when the source is not the one that changed
 * @property recordedAt when the event was recorded
 * @property recordedBy the identity that caused the event
 */
data class Event(
    val id: Long,
    val type: String,
    val sourceId: Long,
    val subjectId: Long?,
    val recordedAt: OffsetDateTime,
    val recordedBy: Long,
)

/** Access to the event resource and the notifications generated from it. */
interface EventNotificationRepository {
    /**
     * Locks and returns the oldest unprocessed events. Events locked by another worker are skipped.
     */
    context(principal: FlexPrincipal)
    suspend fun getEventsToProcess(limit: Int): Either<RepositoryError, List<Event>>

    /** Returns the party of the [identityId], or `0` if it is not a party member, or the system. */
    context(principal: FlexPrincipal)
    suspend fun partyOfIdentity(identityId: Long): Either<RepositoryError, Long>

    /**
     * Creates a notification of the event for each party. Existing notifications are left as they
     * are.
     */
    context(principal: FlexPrincipal)
    suspend fun notifyMany(eventId: Long, partyIds: List<Long>): Either<RepositoryError, Unit>

    /** Marks the given events as processed so they are not picked up again. */
    context(principal: FlexPrincipal)
    suspend fun markProcessed(eventIds: List<Long>): Either<RepositoryError, Unit>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class EventNotificationRepositoryImpl : EventNotificationRepository {

    context(principal: FlexPrincipal)
    override suspend fun getEventsToProcess(limit: Int): Either<RepositoryError, List<Event>> =
        flexTransaction { conn ->
            either {
                runCatching {
                    conn.prepareNamed(
                        """
                        SELECT
                            id,
                            type::text AS type,
                            source_id,
                            subject_id,
                            recorded_at,
                            recorded_by
                        FROM notification.event
                        WHERE processed = false
                        ORDER BY id
                        LIMIT :batch_size
                        FOR UPDATE SKIP LOCKED
                        """,
                        mapOf("batch_size" to limit),
                    ).query { rs ->
                        Event(
                            id = rs.getLong("id"),
                            type = rs.getString("type"),
                            sourceId = rs.getLong("source_id"),
                            subjectId = rs.getLong("subject_id").takeUnless { rs.wasNull() },
                            recordedAt = rs.getObject("recorded_at", OffsetDateTime::class.java),
                            recordedBy = rs.getLong("recorded_by"),
                        )
                    }
                }.getOrElse { e ->
                    logger.error(e) { "getEventsToProcess failed" }
                    raise(DatabaseError("Failed to read events to process"))
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun partyOfIdentity(identityId: Long): Either<RepositoryError, Long> =
        flexTransaction { conn ->
            either {
                runCatching {
                    conn.prepareNamed(
                        "SELECT coalesce(auth.party_of_identity(:identity_id), 0)",
                        mapOf("identity_id" to identityId),
                    ).queryRequiredSingle { rs -> rs.getLong(1) }
                }.getOrElse { e ->
                    logger.error(e) { "partyOfIdentity failed" }
                    raise(DatabaseError("Failed to get the party of identity $identityId"))
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun notifyMany(eventId: Long, partyIds: List<Long>): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            either {
                runCatching {
                    conn.prepareNamed(
                        """
                        INSERT INTO api.notification (event_id, party_id)
                        SELECT :event_id, unnest(:party_ids::bigint[])
                        ON CONFLICT DO NOTHING
                        """,
                        mapOf(
                            "event_id" to eventId,
                            "party_ids" to conn.createBigintArray(partyIds),
                        ),
                    ).use { it.executeUpdate() }
                    Unit
                }.getOrElse { e ->
                    logger.error(e) { "notifyMany failed" }
                    raise(DatabaseError("Failed to create the notifications of event $eventId"))
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun markProcessed(eventIds: List<Long>): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            either {
                runCatching {
                    conn.prepareNamed(
                        """
                        UPDATE notification.event
                        SET processed = true
                        WHERE id = ANY(:event_ids::bigint[])
                        """,
                        mapOf("event_ids" to conn.createBigintArray(eventIds)),
                    ).use { it.executeUpdate() }
                    Unit
                }.getOrElse { e ->
                    logger.error(e) { "markProcessed failed" }
                    raise(DatabaseError("Failed to mark the events as processed"))
                }
            }
        }
}
