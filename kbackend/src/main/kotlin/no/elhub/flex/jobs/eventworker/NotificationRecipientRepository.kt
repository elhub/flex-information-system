package no.elhub.flex.jobs.eventworker

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.query
import org.koin.core.annotation.Single

interface NotificationRecipientRepository {
    /**
     * Returns the parties that should be notified of the [event], as they were at the time of the
     * event. Event types without notifications give an empty list.
     */
    context(principal: FlexPrincipal)
    suspend fun getRecipients(event: Event): Either<RepositoryError, List<Long>>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class NotificationRecipientRepositoryImpl : NotificationRecipientRepository {

    context(principal: FlexPrincipal)
    override suspend fun getRecipients(event: Event): Either<RepositoryError, List<Long>> =
        flexTransaction { conn ->
            either {
                runCatching {
                    val sql = RecipientQueries.forEvent(event)
                    if (sql == null) {
                        emptyList()
                    } else {
                        // only one ID determines the recipients: the subject if there is one,
                        // otherwise the source
                        val params = mapOf(
                            "resource_id" to (event.subjectId ?: event.sourceId),
                            "recorded_at" to event.recordedAt,
                            "ap_id" to event.sourceId,
                            "cu_id" to event.subjectId,
                        )
                        conn.prepareNamed(sql, params)
                            .query { rs -> rs.getLong(1).takeUnless { rs.wasNull() } }
                            .filterNotNull()
                    }
                }.getOrElse { e ->
                    logger.error(e) { "getRecipients failed for event ${event.id} of type ${event.type}" }
                    raise(DatabaseError("Failed to get the notification recipients of event ${event.id}"))
                }
            }
        }
}
