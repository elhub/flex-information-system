package no.elhub.flex.auth.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Session response
 */
@Serializable
public data class SessionResponse(
  /**
   * The entity associated to the user.
   */
  @SerialName("entity_id")
  public val entityId: Int,
  /**
   * The name of the entity associated to the user.
   */
  @SerialName("entity_name")
  public val entityName: String,
  /**
   * The expiration time of the session in Unix time.
   */
  @SerialName("exp")
  public val exp: Int,
  /**
   * The party assumed by the user.
   */
  @SerialName("party_id")
  public val partyId: Int? = null,
  /**
   * The name of the party assumed by the user.
   */
  @SerialName("party_name")
  public val partyName: String? = null,
  /**
   * The auth role in the Flexibility Information System
   */
  @SerialName("role")
  public val role: FlexRole,
)
