package no.elhub.flex.scheduled

import dev.inmo.krontab.doInfinity
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.coroutines.CancellationException
import no.elhub.flex.email.MailService
import org.koin.core.annotation.Single

@Single(createdAtStart = true)
class MailScheduler(private val mailService: MailService) {
    /** Runs every Monday at 06:00. */
    suspend fun start() {
        doInfinity("0 0 6 * * 1w") { runOnce() }
    }

    internal suspend fun runOnce() {
        try {
            logger.info { "Running mail service" }
            mailService.run()
        } catch (ce: CancellationException) {
            throw ce
        } catch (e: Exception) {
            logger.error(e) { "Mail service run failed" }
        }
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
