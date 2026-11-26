package no.elhub.flex.jobs

import arrow.core.getOrElse
import com.zaxxer.hikari.HikariDataSource
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import kotlinx.coroutines.runBlocking
import no.elhub.flex.jobs.eventworker.EventWorkerApp
import no.elhub.flex.jobs.sendnoticemail.SendNoticeMailApp
import no.elhub.flex.jobs.syncaccountingpoint.SyncAccountingPointDataApp
import no.elhub.flex.jobs.syncgridmodel.SyncGridModelDataApp
import no.elhub.flex.jobs.syncmeteringgridarea.SyncMeteringGridAreaDataApp
import no.elhub.flex.jobs.syncparty.SyncPartyDataApp
import no.elhub.flex.shared.http.configureHealth
import org.koin.core.Koin
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.startKoin
import kotlin.system.exitProcess

private val logger = KotlinLogging.logger {}

/**
 * Main function when running the application in job mode.
 * Starts the Koin application of the selected job and runs it. Also starts a minimal Ktor server
 * that only serves the health endpoints, so that Kubernetes can probe them; the server stops when
 * the job ends.
 */
fun runJob(jobName: String) {
    val job = Job.fromString(jobName).getOrElse {
        logger.error { "Unknown job: '$jobName'. Known jobs: ${Job.knownNames()}" }
        exitProcess(1)
    }

    logger.info { "Starting job: ${job.name}" }

    val koin = startKoin(job)

    val port = System.getenv("PORT")?.toIntOrNull() ?: 8080
    val server = embeddedServer(Netty, port = port) { configureHealth(SimpleMeterRegistry()) }
        .start(wait = false)

    val result = try {
        koin.get<HikariDataSource>().use { runBlocking { koin.get<ScheduledJob>().run() } }
    } finally {
        server.stop(1000, 5000)
    }

    result.fold(
        {
            logger.error { "Job '${job.name}' failed: $it" }
            exitProcess(1)
        },
        {
            logger.info { "Job '${job.name}' completed successfully" }
            exitProcess(0)
        },
    )
}

private fun startKoin(job: Job): Koin = when (job) {
    is Job.SyncMeteringGridAreaData -> startKoin<SyncMeteringGridAreaDataApp> { slf4jLogger() }.koin
    is Job.SendNoticeMail -> startKoin<SendNoticeMailApp> { slf4jLogger() }.koin
    is Job.SyncGridModelData -> startKoin<SyncGridModelDataApp> { slf4jLogger() }.koin
    is Job.SyncPartyData -> startKoin<SyncPartyDataApp> { slf4jLogger() }.koin
    is Job.SyncAccountingPointData -> startKoin<SyncAccountingPointDataApp> { slf4jLogger() }.koin
    is Job.EventWorker -> startKoin<EventWorkerApp> { slf4jLogger() }.koin
}
