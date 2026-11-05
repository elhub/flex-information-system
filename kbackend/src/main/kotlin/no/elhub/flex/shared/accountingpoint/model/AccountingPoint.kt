package no.elhub.flex.shared.accountingpoint.model

/**
 * Internal domain representation of an accounting point row from the database.
 *
 * @property id surrogate primary key
 * @property businessId GSRN identifier
 */
data class AccountingPoint(val id: Long, val businessId: String)
