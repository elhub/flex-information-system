package no.elhub.flex.auth.model

/**
 * The identity of the current user, as resolved from the database by `auth.current_user_info()`.
 *
 * @property externalId the external ID (eid) of the identity, as a UUID string
 * @property entityId the entity of the identity
 * @property entityName the name of the entity
 * @property partyId the assumed party, or `null` when no party is assumed
 * @property partyName the name of the assumed party, or `null` when no party is assumed
 */
data class UserInfo(
    val externalId: String,
    val entityId: Long,
    val entityName: String,
    val partyId: Long?,
    val partyName: String?,
)
