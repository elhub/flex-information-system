package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Long
import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Aggregated summary of technical resources belonging to a controllable unit.
 */
@Serializable
public data class ControllableUnitSummaryResponse(
  /**
   * The ID of the controllable unit this resource is a summary of.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Total number of technical resources in the controllable unit.
   */
  @SerialName("count_technical_resource")
  public val countTechnicalResource: Long? = null,
  /**
   * Number of technical resources in the controllable unit, broken down by technology. Keys are
   * technology IDs, values are counts.
   */
  @SerialName("count_technical_resource_by_technology")
  public val countTechnicalResourceByTechnology: Map<String, Long?>? = null,
  /**
   * Sum of maximum active power of all technical resources in the controllable unit.
   */
  @Contextual
  @SerialName("sum_maximum_active_power")
  public val sumMaximumActivePower: BigDecimal? = null,
  /**
   * Sum of maximum active power of all production technical resources in the controllable unit.
   */
  @Contextual
  @SerialName("sum_maximum_active_power_production")
  public val sumMaximumActivePowerProduction: BigDecimal? = null,
  /**
   * Sum of maximum active power of all consumption technical resources in the controllable unit.
   */
  @Contextual
  @SerialName("sum_maximum_active_power_consumption")
  public val sumMaximumActivePowerConsumption: BigDecimal? = null,
  /**
   * Sum of maximum active power of all energy storage technical resources in the controllable unit.
   */
  @Contextual
  @SerialName("sum_maximum_active_power_energy_storage")
  public val sumMaximumActivePowerEnergyStorage: BigDecimal? = null,
  /**
   * Average maximum active power across all technical resources in the controllable unit.
   */
  @Contextual
  @SerialName("average_maximum_active_power")
  public val averageMaximumActivePower: BigDecimal? = null,
)
