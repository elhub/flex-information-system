package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Service Providing Group Product Suspension - history
 */
@Serializable
public data class ServiceProvidingGroupProductSuspensionHistoryResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Reference to the procuring system operator suspending the service providing group.
   */
  @SerialName("procuring_system_operator_id")
  public val procuringSystemOperatorId: Long,
  /**
   * Reference to the service providing group being suspended.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Long,
  /**
   * References to the suspended product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Long>,
  /**
   * The reason for the suspension.
   */
  @SerialName("reason")
  public val reason: ServiceProvidingGroupProductSuspensionReason,
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
  @SerialName("service_providing_group_product_suspension_id")
  public val serviceProvidingGroupProductSuspensionId: Long,
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
