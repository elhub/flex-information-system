package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - The relation allowing an impacted system operator to
 * temporarily suspend a service providing group from delivering services.
 */
@Serializable
public data class ServiceProvidingGroupGridSuspensionCreateRequest(
  /**
   * Reference to the impacted system operator suspending the service providing group.
   */
  @SerialName("impacted_system_operator_id")
  public val impactedSystemOperatorId: Long? = null,
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
)
