package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Per-substation breakdown of controllable units and their technical details for
 * a service providing group.
 */
@Serializable
public data class ServiceProvidingGroupPowerPerSubstationResponse(
  /**
   * Unique surrogate key (service providing group ID).
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * The ID of the service providing group this resource is a breakdown of.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Long? = null,
  /**
   * List of per-substation aggregates for the controllable units currently in the service providing
   * group. Each element contains the substation identifier and name, plus count and maximum active
   * power statistics for the controllable units connected to that substation. An element with null
   * substation fields groups controllable units whose grid location has not yet been assigned.
   */
  @SerialName("substations")
  public val substations: List<ServiceProvidingGroupPowerPerSubstationResponseSubstations>? = null,
  /**
   * Response schema - Group of controllable units
   */
  @SerialName("service_providing_group")
  public val serviceProvidingGroup: ServiceProvidingGroupResponse? = null,
)
