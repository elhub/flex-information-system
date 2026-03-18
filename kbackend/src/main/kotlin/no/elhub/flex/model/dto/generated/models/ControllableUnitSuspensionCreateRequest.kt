package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - The relation allowing an impacted system operator to
 * temporarily suspend a controllable unit.
 */
@Serializable
public data class ControllableUnitSuspensionCreateRequest(
  /**
   * Reference to the suspended controllable unit.
   */
  @SerialName("controllable_unit_id")
  public val controllableUnitId: Int,
  /**
   * Reference to the impacted system operator suspending the controllable unit.
   */
  @SerialName("impacted_system_operator_id")
  public val impactedSystemOperatorId: Int? = null,
  /**
   * The reason for the suspension.
   */
  @SerialName("reason")
  public val reason: ControllableUnitSuspensionReason,
)
