package no.elhub.flex.metrics

import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import no.elhub.flex.model.domain.Party
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
    val controllableUnitLookup = ControllableUnitLookupMetrics(meterRegistry)
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

/**
 * Metrics for controllable unit lookup calls.
 *
 * Tagged by `result` (`success`, `failure`, `wrong_end_user` or `bad_request`), `party_id`,
 * `accounting_point_id`, `party_name`, `party_role` and `party_business_id`.
 */
class ControllableUnitLookupMetrics(private val meterRegistry: MeterRegistry) {

    /** A lookup that returned a successful result. */
    fun success(accountingPointBusinessId: String, party: Party) =
        record("success", accountingPointBusinessId, party)

    /** A lookup that failed because the end user does not match the accounting point. */
    fun wrongEndUser(accountingPointBusinessId: String?, party: Party) =
        record("wrong_end_user", accountingPointBusinessId, party)

    /** A lookup that failed request validation (malformed/missing input). */
    fun badRequest(accountingPointBusinessId: String?, party: Party) =
        record("bad_request", accountingPointBusinessId, party)

    /** A lookup that failed for any other reason. */
    fun failure(accountingPointBusinessId: String?, party: Party) =
        record("failure", accountingPointBusinessId, party)

    private fun record(result: String, accountingPointBusinessId: String?, party: Party) {
        Counter.builder("flex_controllable_unit_lookup_total")
            .tag("result", result)
            .tag("party_id", party.id.toString())
            .tag("accounting_point_id", accountingPointBusinessId ?: "unknown")
            .tag("party_name", party.name)
            .tag("party_role", party.role)
            .tag("party_business_id", party.businessId)
            .description("Number of controllable unit lookups by result, party and accounting point")
            .register(meterRegistry)
            .increment()
    }
}
