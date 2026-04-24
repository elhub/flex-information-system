package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Aggregated summary of controllable units and technical resources belonging to a
 * service providing group.
 */
@Serializable
public data class ServiceProvidingGroupSummaryResponse(
  /**
   * Unique surrogate key (service providing group ID).
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * The ID of the service providing group this resource is a summary of.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Long? = null,
  /**
   * Aggregated statistics on controllable units currently in the service providing group, including
   * count and maximum active power breakdowns (sum, average, min, max) by category and technology.
   */
  @SerialName("controllable_unit")
  public val controllableUnit: ServiceProvidingGroupSummaryResponseControllableUnit? = null,
  /**
   * Aggregated statistics on technical resources belonging to controllable units with active
   * membership in the service providing group, including counts and maximum active power breakdowns
   * (sum, average, min, max) by category and technology.
   */
  @SerialName("technical_resource")
  public val technicalResource: ServiceProvidingGroupSummaryResponseTechnicalResource? = null,
  /**
   * Response schema - Group of controllable units
   */
  @SerialName("service_providing_group")
  public val serviceProvidingGroup: ServiceProvidingGroupResponse? = null,
)
