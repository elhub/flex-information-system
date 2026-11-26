package no.elhub.flex.jobs.syncparty

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
import org.koin.core.annotation.Single

private val logger = KotlinLogging.logger {}

private fun RepositoryError.toJobError() = JobError.DatabaseError(message)

@Single(createdAtStart = true)
class SyncPartyDataJob(
    val adapterClient: AdapterClient,
    val partyStagingRepository: PartyStagingRepository,
    config: SyncPartyDataConfig,
) : ScheduledJob {
    private val finalise = config.finalise

    override suspend fun run(): Either<JobError, Unit> {
        logger.info { "Starting party staging load (finalise=$finalise)" }
        return either {
            val parties = adapterClient.getParties()
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
                        partyStagingRepository.prepareStaging().bind()
                        partyStagingRepository.batchInsertStagingParties(parties).bind()
                        if (finalise) partyStagingRepository.finaliseStaging().bind()
                    }.mapLeft { it.toJobError() }
                }.bind()
            }
        }.also { result ->
            result.onRight { logger.info { "Party staging load complete" } }
            result.onLeft { logger.error { "Party staging load failed: $it" } }
        }
    }
}
