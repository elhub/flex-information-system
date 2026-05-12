package no.elhub.flex.model.dto.generated.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Relation between a system operator and a product type they
 * want to buy.
 */
@Serializable
public data class SystemOperatorProductTypeUpdateRequest(
  /**
   * The status of the relation.
   */
  @SerialName("status")
  public val status: SystemOperatorProductTypeStatus = SystemOperatorProductTypeStatus.ACTIVE,
)
