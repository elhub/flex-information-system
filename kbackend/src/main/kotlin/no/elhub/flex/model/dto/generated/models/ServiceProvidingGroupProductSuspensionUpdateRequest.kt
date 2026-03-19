package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - The relation allowing a procuring system operator to
 * temporarily suspend a service providing group from delivering products of certain types.
 */
@Serializable
public data class ServiceProvidingGroupProductSuspensionUpdateRequest(
  /**
   * References to the suspended product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Int>? = null,
  /**
   * The reason for the suspension.
   */
  @SerialName("reason")
  public val reason: ServiceProvidingGroupProductSuspensionReason? = null,
)
