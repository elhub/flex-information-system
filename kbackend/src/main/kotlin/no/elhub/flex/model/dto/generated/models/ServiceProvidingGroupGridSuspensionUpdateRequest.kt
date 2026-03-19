package no.elhub.flex.model.dto.generated.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - The relation allowing an impacted system operator to
 * temporarily suspend a service providing group from delivering services.
 */
@Serializable
public data class ServiceProvidingGroupGridSuspensionUpdateRequest(
  /**
   * The reason for the suspension.
   */
  @SerialName("reason")
  public val reason: ServiceProvidingGroupGridSuspensionReason? = null,
)
