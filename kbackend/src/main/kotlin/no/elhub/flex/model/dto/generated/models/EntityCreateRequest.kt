package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Entity - Natural or legal person
 *
 * An entity is a natural or legal person that can be a party in the Flexibility Information System.
 *
 * Example entity types:
 *
 * * Person
 * * Organisation
 */
@Serializable
public data class EntityCreateRequest(
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
)
