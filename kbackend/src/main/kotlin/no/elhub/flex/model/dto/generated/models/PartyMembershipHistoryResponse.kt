package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Party Membership - history
 */
@Serializable
public data class PartyMembershipHistoryResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Reference to the party that the membership links to an entity.
   */
  @SerialName("party_id")
  public val partyId: Long,
  /**
   * Reference to the entity that the party represents.
   */
  @SerialName("entity_id")
  public val entityId: Long,
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
  public val recordedBy: Long? = null,
  /**
   * Reference to the resource that was updated.
   */
  @SerialName("party_membership_id")
  public val partyMembershipId: Long,
  /**
   * The identity that updated the resource when it was replaced.
   */
  @SerialName("replaced_by")
  public val replacedBy: Long? = null,
  /**
   * When the resource was replaced in the system.
   */
  @SerialName("replaced_at")
  public val replacedAt: Instant? = null,
)
