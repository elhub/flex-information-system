package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class ServiceProvidingGroupControllableUnitsApplicationsResponse(
  /**
   * The surrogate key of the controllable unit
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * The name of the controllable unit
   */
  @SerialName("name")
  public val name: String? = null,
  /**
   * The surrogate key of the service providing group
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Long? = null,
  /**
   * Details about the grid prequalification for this controllable unit
   */
  @SerialName("grid_prequalification")
  public val gridPrequalification:
      ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification? = null,
  /**
   * Details about the product applications for this controllable unit
   */
  @SerialName("product_applications")
  public val productApplications:
      List<ServiceProvidingGroupControllableUnitsApplicationsResponseProductApplications>? = null,
)
