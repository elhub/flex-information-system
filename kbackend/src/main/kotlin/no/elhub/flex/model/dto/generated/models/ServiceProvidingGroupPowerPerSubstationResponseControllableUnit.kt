package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class ServiceProvidingGroupPowerPerSubstationResponseControllableUnit(
  @SerialName("count")
  public val count: Int? = null,
  @SerialName("maximum_active_power")
  public val maximumActivePower: NumericAggregation? = null,
)
