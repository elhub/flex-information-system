package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Any
import kotlin.Boolean
import kotlin.Long
import kotlin.String
import kotlin.time.Instant
import kotlinx.datetime.LocalDate
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Controllable unit
 */
@Serializable
public data class ControllableUnitResponse(
  /**
   * Unique surrogate key.
   */
  @SerialName("id")
  public val id: Long? = null,
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
   * Reference to the accounting point that the controllable unit is connected to.
   */
  @SerialName("accounting_point_id")
  public val accountingPointId: Long,
  /**
   * Free text field for extra information about the controllable unit if needed.
   */
  @SerialName("additional_information")
  public val additionalInformation: String? = null,
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
   * Response schema - Accounting point for a controllable unit.
   */
  @SerialName("accounting_point")
  public val accountingPoint: AccountingPointResponse? = null,
  /**
   * Embedded controllable_unit_suspension
   */
  @SerialName("suspension")
  public val suspension: Any? = null,
  /**
   * Embedded controllable_unit_service_provider
   */
  @SerialName("service_provider")
  public val serviceProvider: Any? = null,
  /**
   * Embedded service_providing_group_membership
   */
  @SerialName("service_providing_group_membership")
  public val serviceProvidingGroupMembership: Any? = null,
  /**
   * Embedded technical_resource
   */
  @SerialName("technical_resource")
  public val technicalResource: Any? = null,
)
