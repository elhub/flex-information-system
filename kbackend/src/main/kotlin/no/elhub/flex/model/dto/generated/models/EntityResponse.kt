package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Entity - Natural or legal person
 *
 * An entity is a natural or legal person that can be a party in the Flexibility Information System.
 *
 * Example entity types:
 *
 * * Person
 * * Organisation
 */
@Serializable
public data class EntityResponse(
  /**
   * Unique surrogate identifier.
   *
   * Note:
   * This is a Primary Key.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * The business identifier of the entity. Format depends on `business_id_type`.
   */
  @SerialName("business_id")
  public val businessId: String,
  /**
   * The type of the business identifier.
   */
  @SerialName("business_id_type")
  public val businessIdType: EntityBusinessIdType,
  /**
   * Name of the entity. Maximum 128 characters.
   */
  @SerialName("name")
  public val name: String,
  /**
   * The type of the entity, e.g Person, Organisation
   */
  @SerialName("type")
  public val type: EntityType,
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
)
