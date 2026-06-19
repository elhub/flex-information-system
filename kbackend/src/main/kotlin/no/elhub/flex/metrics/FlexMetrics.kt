package no.elhub.flex.metrics

import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import org.koin.core.annotation.Single

/**
 * Central facade for all application metrics.
 *
 * Inject this class wherever metrics need to be recorded. Each metric group is
 * exposed as a named property, keeping Micrometer details out of call sites.
 */
@Single(createdAtStart = true)
class FlexMetrics(meterRegistry: MeterRegistry) {

    val accountingPointSync = AccountingPointSyncMetrics(meterRegistry)
}

/**
 * Metrics for the accounting point sync scheduler.
 */
class AccountingPointSyncMetrics(meterRegistry: MeterRegistry) {

    private val success = Counter.builder("flex_accounting_point_sync_processed_total")
        .tag("result", "success")
        .description("Number of accounting points successfully synced")
        .register(meterRegistry)

    private val failure = Counter.builder("flex_accounting_point_sync_processed_total")
        .tag("result", "failure")
        .description("Number of accounting points that failed to sync")
        .register(meterRegistry)

    fun success() = success.increment()
    fun failure() = failure.increment()
}
