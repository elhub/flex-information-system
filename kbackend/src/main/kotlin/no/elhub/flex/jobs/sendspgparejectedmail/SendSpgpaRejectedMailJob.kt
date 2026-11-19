package no.elhub.flex.jobs.sendspgparejectedmail

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.jobs.JobError
import no.elhub.flex.jobs.ScheduledJob
import no.elhub.flex.jobs.sendnoticemail.MailConfig
import no.elhub.flex.jobs.sendnoticemail.NoticeRecipient
import no.elhub.flex.jobs.sendnoticemail.email.MailClient
import no.elhub.flex.jobs.sendnoticemail.email.MailTemplate
import no.elhub.flex.shared.auth.FlexPrincipal
import org.koin.core.annotation.Single
import java.time.Duration
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit

private val logger = KotlinLogging.logger {}

/**
 * Runs hourly. Mails the members of a service provider when the system operator rejected one of its
 * SPG product applications during the previous full hour. Losing or duplicating a mail is accepted.
 */
@Single(createdAtStart = true)
class SendSpgpaRejectedMailJob(
    private val repository: RejectedSpgpaRecipientRepository,
    private val mailConfig: MailConfig,
    private val mailClient: MailClient,
) : ScheduledJob {

    override suspend fun run(): Either<JobError, Unit> = run(OffsetDateTime.now(ZoneOffset.UTC))

    /** Handles the full hour before the hour containing [now]. */
    suspend fun run(now: OffsetDateTime): Either<JobError, Unit> =
        either {
            ensure(mailConfig.dryRun || (mailConfig.host.isNotBlank() && mailConfig.from.isNotBlank())) {
                JobError.ConfigError("Mail is not configured: MAIL_SMTP_HOST and MAIL_FROM must be set")
            }
            val to = now.truncatedTo(ChronoUnit.HOURS)
            val from = to.minus(Duration.ofHours(1))
            val recipients = with(FlexPrincipal.internalEventNotification) {
                repository.getRecipients(from, to)
                    .mapLeft { JobError.DatabaseError(it.message) }
                    .bind()
            }
            logger.info { "Found ${recipients.size} recipient(s) for rejected SPG product applications in [$from, $to)" }
            recipients.forEach { send(it) }
        }.also { result ->
            result.onLeft { logger.error { "Failed to send rejected SPG product application mails: $it" } }
        }

    private suspend fun send(recipient: NoticeRecipient) {
        try {
            mailClient.send(
                MailTemplate.SPGPA_REJECTED.render(
                    to = recipient.email,
                    variables = mapOf("userName" to recipient.name),
                ),
            )
            logger.info { "Attempted to send mail to entity ${recipient.entityId}" }
        } catch (e: Exception) {
            logger.error(e) { "Failed to send rejected SPG product application mail to entity ${recipient.entityId}" }
        }
    }
}
