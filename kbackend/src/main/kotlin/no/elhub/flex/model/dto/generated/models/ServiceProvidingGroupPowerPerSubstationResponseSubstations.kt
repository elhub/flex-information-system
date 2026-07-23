package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * List of per-substation aggregates for the controllable units currently in the service providing
 * group. Each element contains the substation identifier and name, plus count and maximum active power
 * statistics for the controllable units connected to that substation. An element with null substation
 * fields groups controllable units whose grid location has not yet been assigned.
 */
@Serializable
public data class ServiceProvidingGroupPowerPerSubstationResponseSubstations(
  @SerialName("substation_business_id")
  public val substationBusinessId: String? = null,
  @SerialName("substation_name")
  public val substationName: String? = null,
  @SerialName("controllable_unit")
  public val controllableUnit: ServiceProvidingGroupPowerPerSubstationResponseControllableUnit? =
      null,
)
