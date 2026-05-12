package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Relation between a system operator and a product type they
 * want to buy.
 */
@Serializable
public data class SystemOperatorProductTypeCreateRequest(
  /**
   * Reference to the system operator.
   */
  @SerialName("system_operator_id")
  public val systemOperatorId: Long,
  /**
   * Reference to the product type.
   */
  @SerialName("product_type_id")
  public val productTypeId: Long,
  /**
   * The status of the relation.
   */
  @SerialName("status")
  public val status: SystemOperatorProductTypeStatus = SystemOperatorProductTypeStatus.ACTIVE,
)
