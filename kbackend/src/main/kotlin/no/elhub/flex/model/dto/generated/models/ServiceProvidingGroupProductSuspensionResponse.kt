package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - The relation allowing a procuring system operator to temporarily suspend a
 * service providing group from delivering products of certain types.
 */
@Serializable
public data class ServiceProvidingGroupProductSuspensionResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Reference to the procuring system operator suspending the service providing group.
   */
  @SerialName("procuring_system_operator_id")
  public val procuringSystemOperatorId: Int,
  /**
   * Reference to the service providing group being suspended.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Int,
  /**
   * References to the suspended product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Int>,
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
  public val recordedBy: Int? = null,
)
