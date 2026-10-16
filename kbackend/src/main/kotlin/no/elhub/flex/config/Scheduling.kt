package no.elhub.flex.config

import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.application.Application
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import no.elhub.flex.scheduled.AccountingPointSyncScheduler
import no.elhub.flex.scheduled.MailScheduler
import org.koin.ktor.ext.get

private val logger = KotlinLogging.logger {}

fun Application.configureScheduling(
    accountingPointAdapterSyncEnabled: Boolean,
    mailScheduleEnabled: Boolean = false,
) {
    if (accountingPointAdapterSyncEnabled) {
        launch {
            try {
                get<AccountingPointSyncScheduler>().start()
            } catch (ce: CancellationException) {
                throw ce
            } catch (e: Throwable) {
                logger.error(e) { "Accounting point sync scheduler stopped unexpectedly" }
            }
        }
    } else {
        logger.info { "Accounting point adapter sync disabled; not starting AccountingPointSyncScheduler" }
    }

    if (mailScheduleEnabled) {
        launch {
            try {
                get<MailScheduler>().start()
            } catch (ce: CancellationException) {
                throw ce
            } catch (e: Throwable) {
                logger.error(e) { "Mail scheduler stopped unexpectedly" }
            }
        }
    } else {
        logger.info { "Mail schedule disabled; not starting MailScheduler" }
    }
}
