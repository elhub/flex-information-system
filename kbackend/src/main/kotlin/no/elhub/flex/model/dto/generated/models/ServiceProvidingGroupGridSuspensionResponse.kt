package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
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
  public val id: Long? = null,
  /**
   * Reference to the impacted system operator suspending the service providing group.
   */
  @SerialName("impacted_system_operator_id")
  public val impactedSystemOperatorId: Long,
  /**
   * Reference to the service providing group being suspended.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Long,
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
  public val recordedBy: Long? = null,
  /**
   * Response schema - The body that interacts with the Flexibility Information System
   *
   * A party is the thing that is authorized to access or modify data in the Flexiblity Information
   * System.
   *
   * Example party types:
   *
   * * Service Provider
   * * System Operator
   * * End User
   */
  @SerialName("impacted_system_operator")
  public val impactedSystemOperator: PartyResponse? = null,
  /**
   * Response schema - Group of controllable units
   */
  @SerialName("service_providing_group")
  public val serviceProvidingGroup: ServiceProvidingGroupResponse? = null,
  /**
   * Embedded service_providing_group_grid_suspension_comment
   */
  @SerialName("comment")
  public val comment: List<ServiceProvidingGroupGridSuspensionCommentResponse>? = null,
)
