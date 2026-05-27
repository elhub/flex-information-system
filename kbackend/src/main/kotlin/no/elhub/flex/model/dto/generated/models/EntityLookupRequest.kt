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
   * The business identifier of the entity. Person number, email address, or organisation number,
   * according to `business_id_type`.
   */
  @SerialName("business_id")
  public val businessId: String,
  /**
   * The type of business identifier. For persons, either `pid` (personnummer, 11 digits) or
   * `email`. For organisations, `org` (organisation number, 9 digits).
   */
  @SerialName("business_id_type")
  public val businessIdType: EntityLookupRequestBusinessIdType,
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
