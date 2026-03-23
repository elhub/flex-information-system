package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Client linked to an entity for client credentials and JWT
 * grant authentication methods.
 */
@Serializable
public data class EntityClientUpdateRequest(
  /**
   * Name of the client.
   */
  @SerialName("name")
  public val name: String? = null,
  /**
   * Reference to the party this client allows to assume. A null value means the client cannot
   * assume any party.
   */
  @SerialName("party_id")
  public val partyId: Int? = null,
  /**
   * List of scopes granted to the user when it logs in as an entity or when it acts as the party.
   * When assuming a party through party membership, the least privileged set of scopes will be kept.
   * Scopes are inspired from OAuth 2.0 and allow refinement of access control and privilege
   * delegation mechanisms.
   */
  @SerialName("scopes")
  public val scopes: List<AuthScope>? = null,
  /**
   * The secret of the entity. For use with client credentials authentication method. Input as plain
   * text but stored encrypted.
   */
  @SerialName("client_secret")
  public val clientSecret: String? = null,
  /**
   * The public key of the entity (X.509 SubjectPublicKeyInfo). For use with JWT grant
   * authentication method.
   */
  @SerialName("public_key")
  public val publicKey: String? = null,
)
