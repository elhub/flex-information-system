package no.elhub.flex.jobs

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.coroutines.CancellationException
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.email.MailClient
import no.elhub.flex.email.MailTemplate
import no.elhub.flex.notice.db.NoticeRecipient
import no.elhub.flex.notice.db.NoticeRecipientRepository

private val logger = KotlinLogging.logger {}

/**
 * Sends a notice reminder mail to every recipient that has at least one active notice.
 * Sending is fire-and-forget: a failing send is logged and does not stop the remaining mails.
 */
class SendNoticeMailJob(
    private val mailClient: MailClient,
    private val noticeRecipientRepository: NoticeRecipientRepository,
) : ScheduledJob {
    override suspend fun run(): Either<JobError, Unit> =
        either {
            val recipients = with(FlexPrincipal.internalEventNotification) {
                noticeRecipientRepository.getActiveRecipients()
                    .mapLeft { JobError.DatabaseError(it.message) }
                    .bind()
            }
            logger.info { "Found ${recipients.size} notice recipient(s)" }
            recipients.forEach { send(it) }
        }.also { result ->
            result.onRight { logger.info { "Sending mails done" } }
            result.onLeft { logger.error { "Failed to fetch notice recipients: $it" } }
        }

    private suspend fun send(recipient: NoticeRecipient) {
        try {
            mailClient.send(
                MailTemplate.ACTIVE_NOTICES.render(
                    to = recipient.email,
                    variables = mapOf("userName" to recipient.name),
                ),
            )
            logger.info { "Attempted to send mail to entity ${recipient.entityId}" }
        } catch (e: Exception) {
            logger.error(e) { "Failed to send notice mail to entity ${recipient.entityId}" }
        }
    }
}
