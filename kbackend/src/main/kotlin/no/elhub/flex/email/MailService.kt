package no.elhub.flex.email

import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.coroutines.CancellationException
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.notice.db.NoticeRecipientRepository
import org.koin.core.annotation.Single

@Single
class MailService(
    private val mailClient: MailClient,
    private val noticeRecipientRepository: NoticeRecipientRepository,
) {
    suspend fun run() {
        with(FlexPrincipal.internalEventNotification()) {
            noticeRecipientRepository.getActiveRecipientEmails()
                .onRight { emails ->
                    logger.info { "Found ${emails.size} notice recipient email(s)" }
                    emails.forEach { email -> send(email) }
                }
                .onLeft { e -> logger.error { "Failed to fetch notice recipients: $e" } }
        }
    }

    private suspend fun send(email: String) {
        try {
            mailClient.send(MailTemplate.ACTIVE_NOTICES.render(to = email))
            logger.info { "Attempted to sound mail to $email" }
        } catch (ce: CancellationException) {
            throw ce
        } catch (e: Exception) {
            logger.error(e) { "Failed to send notice mail to $email" }
        }
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
