package no.elhub.flex.shared.metrics

import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry

/**
 * Metrics for accounting point sync (the scheduler and the sync job).
 *
 * Counters are registered by name, so every instance created on the same registry updates the same meters.
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
