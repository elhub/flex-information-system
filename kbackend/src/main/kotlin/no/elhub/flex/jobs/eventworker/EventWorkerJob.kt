package no.elhub.flex.jobs.eventworker

import arrow.core.Either
import arrow.core.getOrElse
import arrow.core.raise.Raise
import arrow.core.raise.either
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import no.elhub.flex.jobs.JobError
import no.elhub.flex.jobs.ScheduledJob
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.tracing.TraceInfo
import no.elhub.flex.shared.tracing.withTrace
import org.koin.core.annotation.Single

private val logger = KotlinLogging.logger {}

/**
 * Generates notifications from the event resource, for as long as it runs.
 *
 * This is a long-running job, it runs continuously until the process is
 * stopped. Events are claimed in batches, processed, and marked as processed,
 * all in the same transaction.
 */
@Single(createdAtStart = true)
class EventWorkerJob(
    private val eventRepository: EventNotificationRepository,
    private val recipientRepository: NotificationRecipientRepository,
    private val config: EventWorkerConfig,
) : ScheduledJob {

    override suspend fun run(): Either<JobError, Unit> {
        logger.info { "Event worker started (poll interval ${config.pollInterval}, batch size ${config.batchSize})" }
        while (currentCoroutineContext().isActive) {
            val hadEvents = withTrace(TraceInfo.fresh()) {
                with(FlexPrincipal.internalEventNotification) {
                    processBatch(config.batchSize)
                        .onLeft { logger.error { "Could not process batch: ${it.message}" } }
                        .getOrElse { false }
                }
            }
            // when there were events, there may be more, so there is no reason to wait
            if (!hadEvents) delay(config.pollInterval)
        }
        return Unit.right()
    }

    /**
     * Processes up to [batchSize] unprocessed events.
     *
     * @return `true` if there were events, `false` if the queue was empty. If an error is
     * returned, the whole batch is rolled back.
     */
    context(principal: FlexPrincipal)
    suspend fun processBatch(batchSize: Int): Either<RepositoryError, Boolean> =
        flexTransaction {
            either {
                val events = eventRepository.getEventsToProcess(batchSize).bind()
                if (events.isEmpty()) {
                    false
                } else {
                    logger.debug { "Processing ${events.size} event(s)" }
                    events.forEach { handle(it) }
                    eventRepository.markProcessed(events.map { it.id }).bind()
                    true
                }
            }
        }

    /** Handles one event and generates notifications for the relevant parties. */
    context(principal: FlexPrincipal)
    private suspend fun Raise<RepositoryError>.handle(event: Event) {
        logger.debug { "Handling event ${event.id} of type ${event.type}" }
        val authorParty = eventRepository.partyOfIdentity(event.recordedBy).bind()
        // the party that caused the event does not get a notification of it
        val recipients = recipientRepository.getRecipients(event).bind().distinct().filter { it != authorParty }

        if (recipients.isEmpty()) {
            logger.debug { "No party to notify of event ${event.id}" }
        } else {
            eventRepository.notifyMany(event.id, recipients).bind()
            logger.info { "Notified ${recipients.size} party(ies) of event ${event.id}" }
        }
    }
}
