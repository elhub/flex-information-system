package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Int
import kotlin.String
import kotlin.time.Instant
import kotlinx.datetime.LocalDate
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Controllable unit
 */
@Serializable
public data class ControllableUnitUpdateRequest(
  /**
   * Free text name of the controllable unit.
   */
  @SerialName("name")
  public val name: String? = null,
  /**
   * The usage date when the controllable unit is first active.
   */
  @SerialName("start_date")
  public val startDate: LocalDate? = null,
  /**
   * The status of the controllable unit.
   */
  @SerialName("status")
  public val status: ControllableUnitStatus = ControllableUnitStatus.NEW,
  /**
   * The regulation direction of the controllable unit. `up` means it can be used to increase
   * production or decrease consumption, while `down` means to decrease production or increase
   * consumption.
   */
  @SerialName("regulation_direction")
  public val regulationDirection: ControllableUnitRegulationDirection? = null,
  /**
   * Maximum continuous active power that the controllable unit can produce or consume, i.e. deliver
   * for balancing and congestion services, in kilowatts.
   */
  @Contextual
  @SerialName("maximum_active_power")
  public val maximumActivePower: BigDecimal? = null,
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
   * Reference to the node that the controllable unit is connected to.
   */
  @SerialName("grid_node_id")
  public val gridNodeId: String? = null,
  /**
   * The grid validation status of the controllable unit.
   */
  @SerialName("grid_validation_status")
  public val gridValidationStatus: ControllableUnitGridValidationStatus =
      ControllableUnitGridValidationStatus.PENDING,
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
)
