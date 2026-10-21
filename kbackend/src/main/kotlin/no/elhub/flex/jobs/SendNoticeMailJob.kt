package no.elhub.flex.jobs

import arrow.core.Either
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.coroutines.CancellationException
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.email.MailClient
import no.elhub.flex.email.MailTemplate
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
        with(FlexPrincipal.internalEventNotification) {
            noticeRecipientRepository.getActiveRecipientEmails()
                .mapLeft<JobError> { JobError.DatabaseError(it.message) }
                .onLeft { logger.error { "Failed to fetch notice recipients: $it" } }
                .onRight { emails ->
                    logger.info { "Found ${emails.size} notice recipient email(s)" }
                    emails.forEach { send(it) }
                }
                .map { }
        }

    private suspend fun send(email: String) {
        try {
            mailClient.send(MailTemplate.ACTIVE_NOTICES.render(to = email))
            logger.info { "Attempted to send mail to $email" }
        } catch (ce: CancellationException) {
            throw ce
        } catch (e: Exception) {
            logger.error(e) { "Failed to send notice mail to $email" }
        }
    }
}
