package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema for entity lookup operations
 */
@Serializable
public data class EntityLookupResponse(
  /**
   * The surrogate key of the entity.
   */
  @SerialName("entity_id")
  public val entityId: Int? = null,
)
