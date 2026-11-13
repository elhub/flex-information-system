package no.elhub.flex.auth.db

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.model.EntityIdentity
import no.elhub.flex.auth.model.UserInfo
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.NotFoundError
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.querySingle
import org.koin.core.annotation.Single

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
    suspend fun getOrCreateEntity(businessId: String, businessIdType: String, name: String): Either<RepositoryError, EntityIdentity>
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
                        mapOf("business_id" to businessId, "business_id_type" to businessIdType, "name" to name),
                    ).querySingle { rs ->
                        EntityIdentity(entityId = rs.getLong("entity_id"), externalId = rs.getString("external_id"))
                    }
                }.getOrElse { e ->
                    logger.error { "getOrCreateEntity failed: ${e.message}" }
                    raise(DatabaseError("Failed to get or create the entity"))
                } ?: raise(DatabaseError("The entity was not returned"))
            }
        }
}
