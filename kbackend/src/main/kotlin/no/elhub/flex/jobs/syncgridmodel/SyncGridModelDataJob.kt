package no.elhub.flex.jobs.syncgridmodel

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.jobs.JobError
import no.elhub.flex.jobs.ScheduledJob
import no.elhub.flex.jobs.syncgridmodel.GridModelRepository
import no.elhub.flex.shared.adapter.AdapterClient
import no.elhub.flex.shared.adapter.HttpError
import no.elhub.flex.shared.adapter.NetworkError
import no.elhub.flex.shared.adapter.NotFoundError
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import org.koin.core.annotation.Single

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class SyncGridModelDataJob(
    val adapterClient: AdapterClient,
    val gridModelRepository: GridModelRepository,
    config: SyncGridModelDataConfig,
) : ScheduledJob {
    private val finalise = config.finalise

    override suspend fun run(): Either<JobError, Unit> {
        logger.info { "Starting grid model staging load (finalise=$finalise)" }
        return either {
            val gridModel = adapterClient.getGridModel()
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
                        gridModelRepository.prepareStaging().bind()
                        gridModelRepository.batchInsertStagingSubstationClusters(gridModel.substationClusters).bind()
                        gridModelRepository.batchInsertStagingSubstations(gridModel.substations).bind()
                        gridModelRepository.batchInsertStagingLines(gridModel.lines).bind()
                        if (finalise) gridModelRepository.finaliseStaging().bind()
                    }.mapLeft { JobError.DatabaseError(it.message) }
                }.bind()
            }
        }.also { result ->
            result.onRight { logger.info { "Grid model staging load complete" } }
            result.onLeft { logger.error { "Grid model staging load failed: $it" } }
        }
    }
}
