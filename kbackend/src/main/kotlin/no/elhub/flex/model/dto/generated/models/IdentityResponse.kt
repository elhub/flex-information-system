package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Resource uniquely identifying a user by linking its entity and the potentially
 * assumed party.
 */
@Serializable
public data class IdentityResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Reference to the entity using the identity.
   */
  @SerialName("entity_id")
  public val entityId: Long? = null,
  /**
   * Name of the entity using the identity.
   */
  @SerialName("entity_name")
  public val entityName: String? = null,
  /**
   * Reference to the party assumed by the entity.
   */
  @SerialName("party_id")
  public val partyId: Long? = null,
  /**
   * Name of the party assumed by the entity.
   */
  @SerialName("party_name")
  public val partyName: String? = null,
)
