package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Grid prequalification for service providing group
 */
@Serializable
public data class ServiceProvidingGroupGridPrequalificationCreateRequest(
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
  public val status: ServiceProvidingGroupGridPrequalificationStatus =
      ServiceProvidingGroupGridPrequalificationStatus.REQUESTED,
  /**
   * When the current grid prequalification was last approved.
   */
  @SerialName("prequalified_at")
  public val prequalifiedAt: Instant? = null,
)
