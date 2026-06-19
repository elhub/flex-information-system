package no.elhub.flex.scheduled

import arrow.core.raise.context.bind
import arrow.core.raise.context.either
import dev.inmo.krontab.doInfinity
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.datetime.TimeZone
import no.elhub.flex.accountingpoint.AccountingPointService
import no.elhub.flex.accountingpoint.db.AccountingPointSyncRepository
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.metrics.FlexMetrics
import no.elhub.flex.model.domain.AccountingPointId
import no.elhub.flex.util.asLocalMidnightInstant
import no.elhub.flex.util.todayLocalMidnight
import org.koin.core.annotation.Property
import org.koin.core.annotation.Single
import kotlin.time.Instant

@Single(createdAtStart = true)
class AccountingPointSyncScheduler(
    private val accountingPointSyncRepository: AccountingPointSyncRepository,
    private val accountingPointService: AccountingPointService,
    private val controllableUnitRepository: ControllableUnitRepository,
    private val metrics: FlexMetrics,
    @Property("flex.timezone") private val timezone: TimeZone = TimeZone.of("Europe/Oslo"),
) {
    suspend fun start() {
        val batchSize = 50
        doInfinity("0 /5 * * *") { runBatch(batchSize) }
    }

    internal suspend fun runBatch(batchSize: Int = 50) {
        either {
            with(FlexPrincipal.internalData()) {
                logger.info { "Started accounting point sync" }
                val accountingPointIdBatch = accountingPointSyncRepository.getBatchForSync(batchSize).bind()

                if (accountingPointIdBatch.isEmpty()) {
                    logger.info { "No accounting points to sync" }
                    return
                }

                logger.info { "Processing batch of ${accountingPointIdBatch.size} accounting points" }

                val accountingPoints = accountingPointService.getByIds(accountingPointIdBatch).bind()

                val earliestStartDates = controllableUnitRepository
                    .getEarliestStartDateByAccountingPointIds(accountingPoints.map { it.id })
                    .bind()

                accountingPoints.forEach { accountingPoint ->
                    either {
                        logger.debug { "Syncing accounting point with id ${accountingPoint.id}.." }
                        val validFrom = earliestStartDates[AccountingPointId(accountingPoint.id)]
                            ?.asLocalMidnightInstant(timezone)
                            ?: Instant.todayLocalMidnight(timezone)
                        accountingPointService.synchronizeAccountingPoint(accountingPoint.businessId, validFrom).bind()
                        logger.debug { "Completed ${accountingPoint.id}" }
                    }.onRight {
                        metrics.accountingPointSync.success()
                    }.onLeft { e ->
                        logger.error { "Failed to sync accounting point ${accountingPoint.id}: $e" }
                        metrics.accountingPointSync.failure()
                    }
                }
                logger.info { "Completed accounting point sync" }
            }
        }.mapLeft { e ->
            logger.error { "Error processing batch: $e" }
        }
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
