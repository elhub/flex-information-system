package no.elhub.flex.model.domain

import kotlin.time.Instant

/**
 * Internal domain representation of an accounting_point_metering_grid_area row from the database.
 *
 * @property id surrogate primary key
 * @property accountingPointId surrogate FK to flex.accounting_point
 * @property meteringGridAreaId surrogate FK to flex.metering_grid_area
 * @property validFrom start of the validity period (inclusive, midnight-aligned), or null if unknown
 * @property validTo end of the validity period (exclusive, midnight-aligned), or null if open-ended
 */
data class AccountingPointMeteringGridArea(
    val id: Long,
    val accountingPointId: Long,
    val meteringGridAreaId: Long,
    val validFrom: Instant?,
    val validTo: Instant?,
)
