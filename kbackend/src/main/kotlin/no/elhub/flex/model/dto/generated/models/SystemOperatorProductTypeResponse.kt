package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Relation between a system operator and a product type they want to buy.
 */
@Serializable
public data class SystemOperatorProductTypeResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Reference to the system operator.
   */
  @SerialName("system_operator_id")
  public val systemOperatorId: Int,
  /**
   * Reference to the product type.
   */
  @SerialName("product_type_id")
  public val productTypeId: Int,
  /**
   * The status of the relation.
   */
  @SerialName("status")
  public val status: SystemOperatorProductTypeStatus,
  /**
   * When the resource was recorded (created or updated) in the system.
   */
  @SerialName("recorded_at")
  public val recordedAt: Instant? = null,
  /**
   * The identity that recorded the resource.
   */
  @SerialName("recorded_by")
  public val recordedBy: Int? = null,
)
