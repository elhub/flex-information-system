package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - The relation allowing an impacted system operator to temporarily suspend a
 * controllable unit.
 */
@Serializable
public data class ControllableUnitSuspensionResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Reference to the suspended controllable unit.
   */
  @SerialName("controllable_unit_id")
  public val controllableUnitId: Long,
  /**
   * Reference to the impacted system operator suspending the controllable unit.
   */
  @SerialName("impacted_system_operator_id")
  public val impactedSystemOperatorId: Long,
  /**
   * The reason for the suspension.
   */
  @SerialName("reason")
  public val reason: ControllableUnitSuspensionReason,
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
   * Response schema - Controllable unit
   */
  @SerialName("controllable_unit")
  public val controllableUnit: ControllableUnitResponse? = null,
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
   * Response schema - Comment made by a party involved in a controllable unit suspension.
   */
  @SerialName("comment")
  public val comment: ControllableUnitSuspensionCommentResponse? = null,
)
