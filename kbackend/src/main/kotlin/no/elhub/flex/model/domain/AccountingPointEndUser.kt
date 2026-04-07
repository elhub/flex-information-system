package no.elhub.flex.model.domain

import kotlin.time.Instant

/**
 * Internal domain representation of a row in flex.accounting_point_end_user.
 *
 * @property accountingPointId surrogate FK to flex.accounting_point
 * @property endUserBusinessId national business ID of the end user (pid or org number)
 * @property validFrom start of the validity period (inclusive, midnight-aligned)
 * @property validTo end of the validity period (exclusive, midnight-aligned), or null if open-ended
 */
data class AccountingPointEndUser(
    val accountingPointId: Int,
    val endUserBusinessId: String,
    val validFrom: Instant,
    val validTo: Instant?,
)
