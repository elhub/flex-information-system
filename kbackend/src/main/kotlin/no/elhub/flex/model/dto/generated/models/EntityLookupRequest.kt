package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for entity lookup operations
 */
@Serializable
public data class EntityLookupRequest(
  /**
   * The business identifier of the entity. Person number or organisation number, according to
   * `type`.
   */
  @SerialName("business_id")
  public val businessId: String,
  /**
   * Name of the entity.
   */
  @SerialName("name")
  public val name: String,
  /**
   * The type of the entity.
   */
  @SerialName("type")
  public val type: EntityLookupRequestType,
)
