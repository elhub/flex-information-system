package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Boolean
import kotlin.Int
import kotlin.String
import kotlin.time.Instant
import kotlinx.datetime.LocalDate
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Controllable unit - history
 */
@Serializable
public data class ControllableUnitHistoryResponse(
  /**
   * Unique surrogate key.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Unique business identifier for the controllable unit.
   */
  @SerialName("business_id")
  public val businessId: String? = null,
  /**
   * Free text name of the controllable unit.
   */
  @SerialName("name")
  public val name: String,
  /**
   * The usage date when the controllable unit is first active.
   */
  @SerialName("start_date")
  public val startDate: LocalDate? = null,
  /**
   * The status of the controllable unit.
   */
  @SerialName("status")
  public val status: ControllableUnitStatus,
  /**
   * The regulation direction of the controllable unit. `up` means it can be used to increase
   * production or decrease consumption, while `down` means to decrease production or increase
   * consumption.
   */
  @SerialName("regulation_direction")
  public val regulationDirection: ControllableUnitRegulationDirection,
  /**
   * Maximum continuous active power that the controllable unit can produce or consume, i.e. deliver
   * for balancing and congestion services, in kilowatts.
   */
  @Contextual
  @SerialName("maximum_active_power")
  public val maximumActivePower: BigDecimal,
  /**
   * Whether the controllable unit is small or not, following NCDR.
   */
  @SerialName("is_small")
  public val isSmall: Boolean? = null,
  /**
   * The minimum activation duration in seconds.
   */
  @SerialName("minimum_duration")
  public val minimumDuration: Int? = null,
  /**
   * The maximum activation duration in seconds.
   */
  @SerialName("maximum_duration")
  public val maximumDuration: Int? = null,
  /**
   * The minimum recovery duration between activations in seconds.
   */
  @SerialName("recovery_duration")
  public val recoveryDuration: Int? = null,
  /**
   * The rate of power per unit of time to reach empty or full power for the controllable unit, in
   * kilowatts per minute.
   */
  @Contextual
  @SerialName("ramp_rate")
  public val rampRate: BigDecimal? = null,
  /**
   * Reference to the accounting point that the controllable unit is connected to.
   */
  @SerialName("accounting_point_id")
  public val accountingPointId: Int,
  /**
   * Reference to the node that the controllable unit is connected to.
   */
  @SerialName("grid_node_id")
  public val gridNodeId: String? = null,
  /**
   * The grid validation status of the controllable unit.
   */
  @SerialName("grid_validation_status")
  public val gridValidationStatus: ControllableUnitGridValidationStatus,
  /**
   * Free text notes on the current grid validation status.
   */
  @SerialName("grid_validation_notes")
  public val gridValidationNotes: String? = null,
  /**
   * When the controllable unit was last validated.
   */
  @SerialName("validated_at")
  public val validatedAt: Instant? = null,
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
  @SerialName("controllable_unit_id")
  public val controllableUnitId: Int,
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
