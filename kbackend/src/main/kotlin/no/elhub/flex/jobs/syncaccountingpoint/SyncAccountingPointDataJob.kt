package no.elhub.flex.jobs.syncaccountingpoint

import arrow.core.Either
import arrow.core.raise.context.bind
import arrow.core.raise.context.either
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.jobs.JobError
import no.elhub.flex.jobs.ScheduledJob
import no.elhub.flex.shared.accountingpoint.AccountingPointService
import no.elhub.flex.shared.accountingpoint.model.AccountingPointId
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.error.AppError
import no.elhub.flex.shared.tracing.TraceInfo
import no.elhub.flex.shared.util.todayLocalMidnight
import no.elhub.flex.shared.util.withTrace
import org.koin.core.annotation.Single
import kotlin.time.Instant

private val logger = KotlinLogging.logger {}

private const val BATCH_SIZE = 50

private fun Any.toJobError(): JobError = when (this) {
    is RepositoryError -> JobError.DatabaseError(message)
    is AppError -> JobError.HttpClientError(code.value, message)
    else -> JobError.DatabaseError(toString())
}

@Single(createdAtStart = true)
class SyncAccountingPointDataJob(
    private val accountingPointSyncRepository: AccountingPointSyncRepository,
    private val accountingPointService: AccountingPointService,
    config: SyncAccountingPointDataConfig,
) : ScheduledJob {
    private val timezone = config.timezone

    override suspend fun run(): Either<JobError, Unit> {
        return either {
            with(FlexPrincipal.internalData) {
                logger.info { "Started accounting point sync" }
                val accountingPointIdBatch = accountingPointSyncRepository.getBatchForSync(BATCH_SIZE).bind()

                if (accountingPointIdBatch.isEmpty()) {
                    logger.info { "No accounting points to sync" }
                    return Unit.right()
                }

                logger.info { "Processing batch of ${accountingPointIdBatch.size} accounting points" }

                val accountingPoints = accountingPointSyncRepository.getByIds(accountingPointIdBatch).bind()

                val earliestStartDates = accountingPointService
                    .getAccountingPointStartDates(accountingPoints.map { it.id })
                    .bind()

                accountingPoints.forEach { accountingPoint ->
                    either {
                        withTrace(TraceInfo.fresh()) {
                            logger.debug { "Syncing accounting point with id ${accountingPoint.id}.." }
                            val validFrom = earliestStartDates[AccountingPointId(accountingPoint.id)]
                                ?: Instant.todayLocalMidnight(timezone)
                            accountingPointService.synchronizeAccountingPoint(accountingPoint.businessId, validFrom).bind()
                            logger.debug { "Accounting point ${accountingPoint.id} completed" }
                        }
                    }.onLeft { e ->
                        logger.error { "Failed to sync accounting point ${accountingPoint.id}: $e" }
                    }
                }
                logger.info { "Completed sync of batch" }
            }
        }.mapLeft { e ->
            logger.error { "Error processing batch: $e" }
            e.toJobError()
        }
    }
}
