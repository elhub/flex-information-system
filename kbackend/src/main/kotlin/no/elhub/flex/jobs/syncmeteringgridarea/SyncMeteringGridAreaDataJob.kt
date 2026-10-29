package no.elhub.flex.jobs.syncmeteringgridarea

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.jobs.JobError
import no.elhub.flex.jobs.ScheduledJob
import no.elhub.flex.shared.adapter.AdapterClient
import no.elhub.flex.shared.adapter.HttpError
import no.elhub.flex.shared.adapter.NetworkError
import no.elhub.flex.shared.adapter.NotFoundError
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError

private val logger = KotlinLogging.logger {}

private fun RepositoryError.toJobError() = JobError.DatabaseError(message)

class SyncMeteringGridAreaDataJob(
    val adapterClient: AdapterClient,
    val meteringGridAreaRepository: MeteringGridAreaStagingRepository,
    private val finalise: Boolean,
) : ScheduledJob {
    override suspend fun run(): Either<JobError, Unit> {
        logger.info { "Starting metering grid area staging load (finalise=$finalise)" }
        return either {
            val meteringGridAreaData = adapterClient.getMeteringGridAreas()
                .mapLeft { error ->
                    when (error) {
                        is HttpError -> JobError.HttpClientError(error.statusCode, error.statusDescription)
                        is NetworkError -> JobError.NetworkError(error.cause ?: "Unknown network error")
                        is NotFoundError -> JobError.HttpClientError(404, "${error.resource} not found: ${error.id}")
                    }
                }.bind()

            with(FlexPrincipal.staging) {
                flexTransaction {
                    either {
                        meteringGridAreaRepository.prepareStaging().bind()
                        meteringGridAreaRepository.batchInsertStagingMeteringGridAreas(meteringGridAreaData).bind()
                        meteringGridAreaRepository.batchInsertStagingMeteringGridAreaSystemOperators(meteringGridAreaData).bind()
                        meteringGridAreaRepository.batchInsertStagingMeteringGridAreaPriceAreas(meteringGridAreaData).bind()
                        if (finalise) meteringGridAreaRepository.finaliseStaging().bind()
                    }.mapLeft { it.toJobError() }
                }.bind()
            }
        }.also { result ->
            result.onRight { logger.info { "Metering grid area staging load complete" } }
            result.onLeft { logger.error { "Metering grid area staging load failed: $it" } }
        }
    }
}
