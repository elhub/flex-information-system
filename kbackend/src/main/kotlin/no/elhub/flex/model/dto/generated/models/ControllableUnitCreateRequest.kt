package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Int
import kotlin.String
import kotlinx.datetime.LocalDate
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Controllable unit
 */
@Serializable
public data class ControllableUnitCreateRequest(
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
  public val status: ControllableUnitStatus = ControllableUnitStatus.NEW,
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
   * Reference to the accounting point that the controllable unit is connected to.
   */
  @SerialName("accounting_point_id")
  public val accountingPointId: Int,
  /**
   * Free text field for extra information about the controllable unit if needed.
   */
  @SerialName("additional_information")
  public val additionalInformation: String? = null,
)
