package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - The relation between a party and entity.
 */
@Serializable
public data class PartyMembershipResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Reference to the party that the membership links to an entity.
   */
  @SerialName("party_id")
  public val partyId: Int,
  /**
   * Reference to the entity that the party represents.
   */
  @SerialName("entity_id")
  public val entityId: Int,
  /**
   * List of scopes granted to the entity when it acts as the party. Scopes are inspired from OAuth
   * 2.0 and allow refinement of access control and privilege delegation mechanisms.
   */
  @SerialName("scopes")
  public val scopes: List<AuthScope>,
  /**
   * When the resource was recorded (created or updated) in the system.
   */
  @SerialName("recorded_at")
  public val recordedAt: Instant? = null,
  /**
   * The identity that recorded the resource.
   */
  @SerialName("recorded_by")
  public val recordedBy: Int? = null,
)
