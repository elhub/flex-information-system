package no.elhub.flex.model.domain

import kotlin.time.Instant

/**
 * Internal domain representation of an accounting point's first from the database.
 *
 * @property controllableUnitStartTime the earliest start date of all CUs behind the accounting point
 * @property controllableUnitServiceProviderValidTimeStart the earliest start date of all CUSP contracts on CUs behind the accounting point
 */
data class AccountingPointStartDates(
    val controllableUnitStartTime: Instant?,
    val controllableUnitServiceProviderValidTimeStart: Instant?,
)
