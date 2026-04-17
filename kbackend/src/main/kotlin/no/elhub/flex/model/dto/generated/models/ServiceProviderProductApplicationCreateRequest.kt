package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Relation between a service provider and a system operator,
 * for the SP to apply for delivering the SO some of the types of product they want to buy on a
 * flexibility market.
 */
@Serializable
public data class ServiceProviderProductApplicationCreateRequest(
  /**
   * Reference to the service provider.
   */
  @SerialName("service_provider_id")
  public val serviceProviderId: Long,
  /**
   * Reference to the system operator.
   */
  @SerialName("system_operator_id")
  public val systemOperatorId: Long,
  /**
   * References to the product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Long>,
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
