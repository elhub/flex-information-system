package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Relation between a service provider and a system operator,
 * for the SP to apply for delivering the SO some of the types of product they want to buy on a
 * flexibility market.
 */
@Serializable
public data class ServiceProviderProductApplicationUpdateRequest(
  /**
   * References to the product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Long>? = null,
  /**
   * The status of the application.
   */
  @SerialName("status")
  public val status: ServiceProviderProductApplicationStatus =
      ServiceProviderProductApplicationStatus.REQUESTED,
  /**
   * When the product application was last validated.
   */
  @SerialName("qualified_at")
  public val qualifiedAt: Instant? = null,
)
