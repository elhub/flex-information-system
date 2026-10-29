package no.elhub.flex.jobs

import arrow.core.getOrElse
import com.zaxxer.hikari.HikariDataSource
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.coroutines.runBlocking
import no.elhub.flex.jobs.syncgridmodel.SyncGridModelDataApp
import no.elhub.flex.jobs.syncmeteringgridarea.SyncMeteringGridAreaDataApp
import org.koin.core.Koin
import org.koin.logger.slf4jLogger
import org.koin.plugin.module.dsl.startKoin
import kotlin.system.exitProcess

private val logger = KotlinLogging.logger {}

/**
 * Main function when running the application in job mode.
 * Starts the Koin application of the selected job and runs it, without launching any Ktor application.
 */
fun runJob(jobName: String) {
    val job = Job.fromString(jobName).getOrElse {
        logger.error { "Unknown job: '$jobName'. Known jobs: ${Job.knownNames()}" }
        exitProcess(1)
    }

    logger.info { "Starting job: ${job.name}" }
    val koin = startKoin(job)
    val result = koin.get<HikariDataSource>().use { runBlocking { koin.get<ScheduledJob>().run() } }

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
    is Job.SyncGridModelData -> startKoin<SyncGridModelDataApp> { slf4jLogger() }.koin
}
