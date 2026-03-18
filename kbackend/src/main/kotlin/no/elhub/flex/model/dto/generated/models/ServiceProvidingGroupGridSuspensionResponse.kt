package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - The relation allowing an impacted system operator to temporarily suspend a
 * service providing group from delivering services.
 */
@Serializable
public data class ServiceProvidingGroupGridSuspensionResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Reference to the impacted system operator suspending the service providing group.
   */
  @SerialName("impacted_system_operator_id")
  public val impactedSystemOperatorId: Int,
  /**
   * Reference to the service providing group being suspended.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Int,
  /**
   * The reason for the suspension.
   */
  @SerialName("reason")
  public val reason: ServiceProvidingGroupGridSuspensionReason,
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
