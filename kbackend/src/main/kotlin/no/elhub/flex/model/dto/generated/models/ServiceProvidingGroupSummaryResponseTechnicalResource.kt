package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Aggregated statistics on technical resources belonging to controllable units with active
 * membership in the service providing group, including counts and maximum active power breakdowns
 * (sum, average, min, max) by category and technology.
 */
@Serializable
public data class ServiceProvidingGroupSummaryResponseTechnicalResource(
  @SerialName("count")
  public val count: Int? = null,
  @SerialName("maximum_active_power")
  public val maximumActivePower: NumericAggregation? = null,
  @SerialName("by_category")
  public val byCategory: Map<String, ByCategoryValue?>? = null,
  @SerialName("by_technology")
  public val byTechnology: Map<String, ByTechnologyValue?>? = null,
)
