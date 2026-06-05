package no.elhub.flex.model.domain

import kotlin.time.Instant

/**
 * Internal domain representation of a row in flex.accounting_point_metering_grid_area.
 *
 * @property accountingPointId surrogate FK to flex.accounting_point
 * @property meteringGridAreaBusinessId EIC-Y business ID of the metering grid area
 * @property validFrom start of the validity period (inclusive, midnight-aligned)
 * @property validTo end of the validity period (exclusive, midnight-aligned), or null if open-ended
 */
data class AccountingPointMeteringGridArea(
    val accountingPointId: Long,
    val meteringGridAreaBusinessId: String,
    val validFrom: Instant,
    val validTo: Instant?,
)
