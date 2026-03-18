package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - The relation between a party and entity.
 */
@Serializable
public data class PartyMembershipCreateRequest(
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
)
