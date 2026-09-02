package no.elhub.flex.model.domain

/**
 * Internal domain representation of a party row from the database.
 *
 * @property id surrogate primary key
 * @property name the party's display name
 * @property role the role associated with this party (e.g. `flex_service_provider`)
 * @property businessId the party's external business identifier (GLN, org number, EIC-X, or UUID)
 */
data class Party(val id: Long, val name: String, val role: String, val businessId: String)
