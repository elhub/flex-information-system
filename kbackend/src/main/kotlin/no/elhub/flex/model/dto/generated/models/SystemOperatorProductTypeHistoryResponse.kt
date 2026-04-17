package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * System Operator Product Type - history
 */
@Serializable
public data class SystemOperatorProductTypeHistoryResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
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
  public val recordedBy: Long? = null,
  /**
   * Reference to the resource that was updated.
   */
  @SerialName("system_operator_product_type_id")
  public val systemOperatorProductTypeId: Long,
  /**
   * The identity that updated the resource when it was replaced.
   */
  @SerialName("replaced_by")
  public val replacedBy: Long? = null,
  /**
   * When the resource was replaced in the system.
   */
  @SerialName("replaced_at")
  public val replacedAt: Instant? = null,
)
