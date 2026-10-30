package no.elhub.flex.email

import io.github.oshai.kotlinlogging.KotlinLogging

private val logger = KotlinLogging.logger {}

/** A [MailClient] that does not deliver anything. Used for dry runs. The recipient address is not logged. */
class LoggingMailClient : MailClient {
    override suspend fun send(mail: Mail) {
        logger.info { "Dry run: mail not delivered, subject '${mail.subject}'" }
    }
}
