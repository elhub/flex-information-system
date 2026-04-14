package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Grid prequalification for service providing group
 */
@Serializable
public data class ServiceProvidingGroupGridPrequalificationResponse(
  /**
   * Unique surrogate key.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Reference to the service providing group whose grid prequalification is tracked by the current
   * resource.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Long,
  /**
   * Reference to the `party` that is the impacted system operator.
   */
  @SerialName("impacted_system_operator_id")
  public val impactedSystemOperatorId: Long,
  /**
   * The status of the grid prequalification for this service providing group.
   */
  @SerialName("status")
  public val status: ServiceProvidingGroupGridPrequalificationStatus,
  /**
   * When the current grid prequalification was last approved.
   */
  @SerialName("prequalified_at")
  public val prequalifiedAt: Instant? = null,
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
)
