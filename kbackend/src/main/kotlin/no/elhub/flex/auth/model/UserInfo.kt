package no.elhub.flex.auth.model

import no.elhub.flex.auth.scope.DefaultOwnedPartyScopes
import no.elhub.flex.auth.scope.Scope

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

/**
 * The identity of an entity without party association, as returned by `auth.entity_identity_of_external_id()`.
 *
 * @property externalId the external ID of the identity without party
 * @property clientId the entity client the identity logged in with, or `null` for a person
 * @property scopes the scopes of the entity client, or `null` for a person
 */
data class BareEntityIdentity(
    val externalId: String,
    val clientId: String?,
    val scopes: List<Scope>?,
)

/** An entity client, as returned by `auth.entity_client_by_client_id()`. */
data class EntityClient(
    val id: Long,
    val entityId: Long,
    val externalId: String,
    val clientId: String,
    val partyId: Long?,
    val scopes: List<Scope>,
    val name: String?,
    val publicKey: String?,
)

/**
 * The party assumed by an entity, as returned by `auth.assume_party()`.
 *
 * @property scopes the scopes of the entity for the party (those of the membership, or the default
 * ones of an owner), or `null` if the database gives none
 */
data class AssumedParty(
    val entityId: Long,
    val externalId: String,
    val role: String,
    val scopes: List<Scope>?,
) {
    /** The scopes of the party: those of the membership, or the default ones when the database gives none. */
    fun partyScopes(): List<Scope> = scopes ?: DefaultOwnedPartyScopes
}

/**
 * The entity of a person and the external ID of its identity (without party), as returned by
 * `auth.get_or_create_entity()`.
 */
data class EntityIdentity(
    val entityId: Long,
    val externalId: String,
)
