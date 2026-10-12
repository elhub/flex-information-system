package no.elhub.flex.jobs

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.integration.adapter.AdapterClient
import no.elhub.flex.integration.adapter.HttpError
import no.elhub.flex.integration.adapter.NetworkError
import no.elhub.flex.integration.adapter.NotFoundError
import no.elhub.flex.meteringgridarea.db.MeteringGridAreaRepository
import no.elhub.flex.model.domain.db.RepositoryError

private val logger = KotlinLogging.logger {}

/** Role allowed to run the `staging.*` functions and write to the staging tables. */
private val stagingPrincipal = FlexPrincipal(role = "flex_staging_structure_data", eid = "0")

private fun RepositoryError.toJobError() = JobError.DatabaseError(message)

class SyncMeteringGridAreaDataJob(
    val adapterClient: AdapterClient,
    val meteringGridAreaRepository: MeteringGridAreaRepository,
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

            with(stagingPrincipal) {
                meteringGridAreaRepository.prepareStaging().mapLeft { it.toJobError() }.bind()
                meteringGridAreaRepository.batchInsertStagingMeteringGridAreas(meteringGridAreaData).mapLeft { it.toJobError() }.bind()
                meteringGridAreaRepository.batchInsertStagingMeteringGridAreaSystemOperators(meteringGridAreaData).mapLeft { it.toJobError() }.bind()
                meteringGridAreaRepository.batchInsertStagingMeteringGridAreaPriceAreas(meteringGridAreaData).mapLeft { it.toJobError() }.bind()
                if (finalise) meteringGridAreaRepository.finaliseStaging().mapLeft { it.toJobError() }.bind()
            }
        }.also { result ->
            result.onRight { logger.info { "Metering grid area staging load complete" } }
            result.onLeft { logger.error { "Metering grid area staging load failed: $it" } }
        }
    }
}
