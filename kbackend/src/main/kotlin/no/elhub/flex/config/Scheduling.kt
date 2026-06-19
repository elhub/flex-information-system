package no.elhub.flex.config

import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.application.Application
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import no.elhub.flex.scheduled.AccountingPointSyncScheduler
import org.koin.ktor.ext.get

private val logger = KotlinLogging.logger {}

fun Application.configureScheduling() {
    launch {
        try {
            get<AccountingPointSyncScheduler>().start()
        } catch (ce: CancellationException) {
            throw ce
        } catch (e: Throwable) {
            logger.error(e) { "Accounting point sync scheduler stopped unexpectedly" }
        }
    }
}
