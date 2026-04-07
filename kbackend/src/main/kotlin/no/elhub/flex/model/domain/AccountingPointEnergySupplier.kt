package no.elhub.flex.model.domain

import kotlin.time.Instant

/**
 * Internal domain representation of a row in flex.accounting_point_energy_supplier.
 *
 * @property accountingPointId surrogate FK to flex.accounting_point
 * @property energySupplierBusinessId GLN of the energy supplier
 * @property validFrom start of the validity period (inclusive, midnight-aligned)
 * @property validTo end of the validity period (exclusive, midnight-aligned), or null if open-ended
 */
data class AccountingPointEnergySupplier(
    val accountingPointId: Int,
    val energySupplierBusinessId: String,
    val validFrom: Instant,
    val validTo: Instant?,
)
