package no.elhub.flex.model.dto.generated.models

import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - The relation between a party and entity.
 */
@Serializable
public data class PartyMembershipUpdateRequest(
  /**
   * List of scopes granted to the entity when it acts as the party. Scopes are inspired from OAuth
   * 2.0 and allow refinement of access control and privilege delegation mechanisms.
   */
  @SerialName("scopes")
  public val scopes: List<AuthScope>? = null,
)
