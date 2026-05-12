package no.elhub.flex.model.dto.generated.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - The relation allowing an impacted system operator to
 * temporarily suspend a controllable unit.
 */
@Serializable
public data class ControllableUnitSuspensionUpdateRequest(
  /**
   * The reason for the suspension.
   */
  @SerialName("reason")
  public val reason: ControllableUnitSuspensionReason? = null,
)
