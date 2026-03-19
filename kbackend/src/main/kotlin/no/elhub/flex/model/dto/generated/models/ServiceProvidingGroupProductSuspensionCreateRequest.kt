package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - The relation allowing a procuring system operator to
 * temporarily suspend a service providing group from delivering products of certain types.
 */
@Serializable
public data class ServiceProvidingGroupProductSuspensionCreateRequest(
  /**
   * Reference to the procuring system operator suspending the service providing group.
   */
  @SerialName("procuring_system_operator_id")
  public val procuringSystemOperatorId: Int? = null,
  /**
   * Reference to the service providing group being suspended.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Int,
  /**
   * References to the suspended product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Int>,
  /**
   * The reason for the suspension.
   */
  @SerialName("reason")
  public val reason: ServiceProvidingGroupProductSuspensionReason,
)
