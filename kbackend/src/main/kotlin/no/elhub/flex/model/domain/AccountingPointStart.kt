package no.elhub.flex.model.domain

import kotlin.time.Instant

/**
 * Internal domain representation of an accounting point start row from the database.
 *
 * @property accountingPointId internal ID of the accounting point
 * @property controllableUnitStartTime the earliest start date of all CUs behind the accounting point
 * @property controllableUnitServiceProviderValidTimeStart the earliest start date of all CUSP contracts on CUs behind the accounting point
 */
data class AccountingPointStart(
    val accountingPointId: Long,
    val controllableUnitStartTime: Instant?,
    val controllableUnitServiceProviderValidTimeStart: Instant?,
)
