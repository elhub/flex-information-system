package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Grid prequalification for service providing group - history
 */
@Serializable
public data class ServiceProvidingGroupGridPrequalificationHistoryResponse(
  /**
   * Unique surrogate key.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Reference to the service providing group whose grid prequalification is tracked by the current
   * resource.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Int,
  /**
   * Reference to the `party` that is the impacted system operator.
   */
  @SerialName("impacted_system_operator_id")
  public val impactedSystemOperatorId: Int,
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
  public val recordedBy: Int? = null,
  /**
   * Reference to the resource that was updated.
   */
  @SerialName("service_providing_group_grid_prequalification_id")
  public val serviceProvidingGroupGridPrequalificationId: Int,
  /**
   * The identity that updated the resource when it was replaced.
   */
  @SerialName("replaced_by")
  public val replacedBy: Int? = null,
  /**
   * When the resource was replaced in the system.
   */
  @SerialName("replaced_at")
  public val replacedAt: Instant? = null,
)
