package no.elhub.flex.api.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Int
import kotlin.Long
import kotlin.String
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Flexible power per substation for a service providing group grid
 * prequalification, together with the total approved flexible power of the substation across all
 * approved grid prequalifications of the same impacted system operator.
 */
@Serializable
public data class ServiceProvidingGroupGridPrequalificationSubstationPowerResponse(
  /**
   * The ID of the service providing group grid prequalification.
   */
  @SerialName("service_providing_group_grid_prequalification_id")
  public val serviceProvidingGroupGridPrequalificationId: Long? = null,
  /**
   * Business ID of the substation.
   */
  @SerialName("substation_business_id")
  public val substationBusinessId: String? = null,
  /**
   * Name of the substation.
   */
  @SerialName("substation_name")
  public val substationName: String? = null,
  /**
   * Number of controllable units currently in the service providing group at the substation.
   */
  @SerialName("controllable_unit_count")
  public val controllableUnitCount: Int? = null,
  /**
   * Sum of the maximum active power of the controllable units currently in the service providing
   * group at the substation, in kW.
   */
  @Contextual
  @SerialName("maximum_active_power")
  public val maximumActivePower: BigDecimal? = null,
  /**
   * Total approved flexible power at the substation, in kW. It is the sum of the maximum active
   * power of the controllable units of all service providing groups with an approved or conditionally
   * approved grid prequalification for the same impacted system operator, each controllable unit
   * counted once. Controllable units added to a group after its approval are not included until the
   * changes are approved. Controllable units without a substation are not included. Zero when nothing
   * is approved.
   */
  @Contextual
  @SerialName("total_approved_maximum_active_power")
  public val totalApprovedMaximumActivePower: BigDecimal? = null,
  /**
   * Response schema - Grid prequalification for service providing group
   */
  @SerialName("service_providing_group_grid_prequalification")
  public val serviceProvidingGroupGridPrequalification:
      ServiceProvidingGroupGridPrequalificationResponse? = null,
)
