package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class ControllableUnitSummaryResponseTechnicalResource(
  @SerialName("count")
  public val count: Int? = null,
  @SerialName("maximum_active_power")
  public val maximumActivePower: NumericAggregation? = null,
  @SerialName("by_category")
  public val byCategory: Map<String, ByCategoryValue?>? = null,
  @SerialName("by_technology")
  public val byTechnology: Map<String, ByTechnologyValue?>? = null,
)
