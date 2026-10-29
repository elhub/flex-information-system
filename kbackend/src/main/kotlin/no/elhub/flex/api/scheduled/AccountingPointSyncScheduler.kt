package no.elhub.flex.api.scheduled

import arrow.core.raise.context.bind
import arrow.core.raise.context.either
import dev.inmo.krontab.doInfinity
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.api.accountingpoint.AccountingPointService
import no.elhub.flex.api.accountingpoint.db.AccountingPointSyncRepository
import no.elhub.flex.api.config.FlexConfig
import no.elhub.flex.api.metrics.FlexMetrics
import no.elhub.flex.api.model.domain.AccountingPointId
import no.elhub.flex.api.util.todayLocalMidnight
import no.elhub.flex.api.util.withTrace
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.tracing.TraceInfo
import org.koin.core.annotation.Single
import kotlin.time.Instant

@Single(createdAtStart = true)
class AccountingPointSyncScheduler(
    private val accountingPointSyncRepository: AccountingPointSyncRepository,
    private val accountingPointService: AccountingPointService,
    private val metrics: FlexMetrics,
    flexConfig: FlexConfig,
) {
    private val timezone = flexConfig.zone

    suspend fun start() {
        val batchSize = 50
        doInfinity("0 /5 * * *") { runBatch(batchSize) }
    }

    internal suspend fun runBatch(batchSize: Int = 50) {
        either {
            with(FlexPrincipal.internalData) {
                logger.info { "Started accounting point sync" }
                val accountingPointIdBatch = accountingPointSyncRepository.getBatchForSync(batchSize).bind()

                if (accountingPointIdBatch.isEmpty()) {
                    logger.info { "No accounting points to sync" }
                    return
                }

                logger.info { "Processing batch of ${accountingPointIdBatch.size} accounting points" }

                val accountingPoints = accountingPointService.getByIds(accountingPointIdBatch).bind()

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
                    }.onRight {
                        metrics.accountingPointSync.success()
                    }.onLeft { e ->
                        logger.error { "Failed to sync accounting point ${accountingPoint.id}: $e" }
                        metrics.accountingPointSync.failure()
                    }
                }
                logger.info { "Completed sync of batch" }
            }
        }.mapLeft { e ->
            logger.error { "Error processing batch: $e" }
        }
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
