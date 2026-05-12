package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - The relation allowing a procuring system operator to
 * temporarily suspend a service provider from delivering them products of the given types.
 */
@Serializable
public data class ServiceProviderProductSuspensionUpdateRequest(
  /**
   * References to the suspended product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Long>? = null,
  /**
   * The reason for the suspension.
   */
  @SerialName("reason")
  public val reason: ServiceProviderProductSuspensionReason? = null,
)
