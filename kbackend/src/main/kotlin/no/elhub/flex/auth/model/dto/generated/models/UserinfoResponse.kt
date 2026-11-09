package no.elhub.flex.auth.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Information about the current user
 */
@Serializable
public data class UserinfoResponse(
  /**
   * The identity of the user, uniquely identifying who they are and which party they are assuming.
   */
  @SerialName("sub")
  public val sub: String,
  /**
   * The entity associated to the user.
   */
  @SerialName("entity_id")
  public val entityId: Long? = null,
  /**
   * The name of the entity associated to the user.
   */
  @SerialName("entity_name")
  public val entityName: String? = null,
  /**
   * The party assumed by the user.
   */
  @SerialName("party_id")
  public val partyId: Long? = null,
  /**
   * The name of the party assumed by the user.
   */
  @SerialName("party_name")
  public val partyName: String? = null,
  /**
   * The auth role in the Flexibility Information System
   */
  @SerialName("current_role")
  public val currentRole: FlexRole? = null,
)
