package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Aggregated statistics on controllable units currently in the service providing group, including
 * count and maximum active power information (sum, average, min, max).
 */
@Serializable
public data class ServiceProvidingGroupSummaryResponseControllableUnit(
  @SerialName("count")
  public val count: Int? = null,
  @SerialName("maximum_active_power")
  public val maximumActivePower: NumericAggregation? = null,
)
