package no.elhub.flex.auth.db

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.model.AssumedParty
import no.elhub.flex.auth.model.BareEntityIdentity
import no.elhub.flex.auth.model.EntityClient
import no.elhub.flex.auth.model.EntityIdentity
import no.elhub.flex.auth.model.UserInfo
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.NoMatchError
import no.elhub.flex.shared.db.NotFoundError
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.querySingle
import org.koin.core.annotation.Single
import java.sql.ResultSet

/** Access to the `auth.*` functions of the database. */
interface AuthRepository {
    /**
     * Reads the identity of the current [principal] with `auth.current_user_info()`.
     *
     * Returns [NotFoundError] when the principal has no identity in the database.
     */
    context(principal: FlexPrincipal)
    suspend fun currentUserInfo(): Either<RepositoryError, UserInfo>

    /**
     * Gets the entity of a person from their business ID, creating it if it does not exist, with
     * `auth.get_or_create_entity()`. Meant for the login of a person, who has no identity yet.
     */
    context(principal: FlexPrincipal)
    suspend fun getOrCreateEntity(
        businessId: String,
        businessIdType: String,
        name: String,
    ): Either<RepositoryError, EntityIdentity>

    /**
     * Gets the identity of the same entity and client as the identity [externalId], but without
     * party association, with `auth.entity_identity_of_external_id()`.
     *
     * Returns [NotFoundError] when there is no such identity.
     */
    context(principal: FlexPrincipal)
    suspend fun entityIdentityOfExternalId(externalId: String): Either<RepositoryError, BareEntityIdentity>

    /**
     * Gets the entity client with the given client ID with `auth.entity_client_by_client_id()`.
     * Meant for the login of a client, who has no identity yet.
     *
     * Returns [NotFoundError] when there is no such client.
     */
    context(principal: FlexPrincipal)
    suspend fun entityClientByClientId(clientId: String): Either<RepositoryError, EntityClient>

    /**
     * Checks that the entity of the current [principal] can assume the party and gets the details
     * of the assumption, with `auth.assume_party()`.
     *
     * Returns [NoMatchError] when the entity can neither assume nor own the party.
     */
    context(principal: FlexPrincipal)
    suspend fun assumeParty(partyId: Long): Either<RepositoryError, AssumedParty>

    /**
     * Gets the ID of the party with the given business ID and type, if the entity can assume it
     * (i.e. it is a member of the party or owns it).
     *
     * Returns [NotFoundError] when there is no such party or the entity cannot assume it.
     */
    context(principal: FlexPrincipal)
    suspend fun assumablePartyId(entityId: Long, partyBusinessId: String, partyType: String): Either<RepositoryError, Long>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class AuthRepositoryImpl : AuthRepository {

    context(principal: FlexPrincipal)
    override suspend fun currentUserInfo(): Either<RepositoryError, UserInfo> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        """
                        SELECT external_id, entity_id, entity_name, party_id, party_name
                        FROM auth.current_user_info()
                        """,
                        emptyMap(),
                    ).querySingle { rs ->
                        UserInfo(
                            externalId = rs.getString("external_id"),
                            entityId = rs.getLong("entity_id"),
                            entityName = rs.getString("entity_name"),
                            partyId = rs.getLong("party_id").takeUnless { rs.wasNull() },
                            partyName = rs.getString("party_name"),
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "currentUserInfo failed: ${e.message}" }
                    raise(DatabaseError("Failed to read the current user info"))
                }

                row ?: run {
                    logger.info { "No identity found for the current principal" }
                    raise(NotFoundError("identity does not exist in database"))
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun getOrCreateEntity(
        businessId: String,
        businessIdType: String,
        name: String,
    ): Either<RepositoryError, EntityIdentity> =
        flexTransaction { conn ->
            either {
                runCatching {
                    conn.prepareNamed(
                        """
                        SELECT entity_id, external_id
                        FROM auth.get_or_create_entity(:business_id, :business_id_type, :name)
                        """,
                        mapOf(
                            "business_id" to businessId,
                            "business_id_type" to businessIdType,
                            "name" to name,
                        ),
                    ).querySingle { rs ->
                        EntityIdentity(
                            entityId = rs.getLong("entity_id"),
                            externalId = rs.getString("external_id"),
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "getOrCreateEntity failed: ${e.message}" }
                    raise(DatabaseError("Failed to get or create the entity"))
                } ?: raise(DatabaseError("The entity was not returned"))
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun entityIdentityOfExternalId(
        externalId: String,
    ): Either<RepositoryError, BareEntityIdentity> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        """
                        SELECT external_id, client_id, scopes
                        FROM auth.entity_identity_of_external_id(:external_id)
                        """,
                        mapOf("external_id" to externalId),
                    ).querySingle { rs ->
                        BareEntityIdentity(
                            externalId = rs.getString("external_id"),
                            clientId = rs.getString("client_id"),
                            scopes = rs.getScopes("scopes"),
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "entityIdentityOfExternalId failed: ${e.message}" }
                    raise(DatabaseError("Failed to read the identity of the entity"))
                }

                row ?: raise(NotFoundError("identity does not exist in database"))
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun entityClientByClientId(
        clientId: String,
    ): Either<RepositoryError, EntityClient> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        """
                        SELECT
                            id,
                            entity_id,
                            external_id,
                            client_id,
                            party_id,
                            scopes,
                            name,
                            public_key
                        FROM auth.entity_client_by_client_id(:client_id)
                        """,
                        mapOf("client_id" to clientId),
                    ).querySingle { rs ->
                        EntityClient(
                            id = rs.getLong("id"),
                            entityId = rs.getLong("entity_id"),
                            externalId = rs.getString("external_id"),
                            clientId = rs.getString("client_id"),
                            partyId = rs.getLong("party_id").takeUnless { rs.wasNull() },
                            scopes = rs.getScopes("scopes").orEmpty(),
                            name = rs.getString("name"),
                            publicKey = rs.getString("public_key"),
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "entityClientByClientId failed: ${e.message}" }
                    raise(DatabaseError("Failed to read the entity client"))
                }

                row ?: raise(NotFoundError("entity client does not exist in database"))
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun assumeParty(partyId: Long): Either<RepositoryError, AssumedParty> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        """
                        SELECT entity_id, eid, role, scopes
                        FROM auth.assume_party(:party_id)
                        """,
                        mapOf("party_id" to partyId),
                    ).querySingle { rs ->
                        // the function returns a row of nulls when the party cannot be assumed
                        rs.getString("eid")?.let { eid ->
                            AssumedParty(
                                entityId = rs.getLong("entity_id"),
                                externalId = eid,
                                role = rs.getString("role"),
                                scopes = rs.getScopes("scopes"),
                            )
                        }
                    }
                }.getOrElse { e ->
                    logger.warn { "assumeParty failed: ${e.message}" }
                    raise(DatabaseError("Failed to assume the party"))
                }

                row ?: raise(NoMatchError("party cannot be assumed by the entity"))
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun assumablePartyId(
        entityId: Long,
        partyBusinessId: String,
        partyType: String,
    ): Either<RepositoryError, Long> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        """
                        SELECT p.id AS party_id
                        FROM flex.entity AS e
                            INNER JOIN flex.party_membership AS pm ON e.id = pm.entity_id
                            INNER JOIN flex.party AS p ON pm.party_id = p.id
                        WHERE e.id = :entity_id
                            AND p.business_id = :business_id
                            AND p.type = :party_type
                        UNION ALL
                        SELECT p.id AS party_id
                        FROM flex.party AS p
                        WHERE p.entity_id = :entity_id
                            AND p.business_id = :business_id
                            AND p.type = :party_type
                        LIMIT 1
                        """,
                        mapOf("entity_id" to entityId, "business_id" to partyBusinessId, "party_type" to partyType),
                    ).querySingle { rs -> rs.getLong("party_id") }
                }.getOrElse { e ->
                    logger.error { "assumablePartyId failed: ${e.message}" }
                    raise(DatabaseError("Failed to get the party ID"))
                }

                row ?: raise(NotFoundError("party does not exist or cannot be assumed"))
            }
        }
}

/** Reads a `text[]` column of scope strings, `null` if the column is null. */
private fun ResultSet.getScopes(column: String): List<Scope>? =
    (getArray(column)?.array as Array<*>?)?.map { Scope.fromString(it as String) ?: error("invalid scope '$it'") }
