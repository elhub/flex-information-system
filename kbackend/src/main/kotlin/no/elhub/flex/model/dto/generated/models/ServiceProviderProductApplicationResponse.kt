package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Relation between a service provider and a system operator, for the SP to apply
 * for delivering the SO some of the types of product they want to buy on a flexibility market.
 */
@Serializable
public data class ServiceProviderProductApplicationResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Reference to the service provider.
   */
  @SerialName("service_provider_id")
  public val serviceProviderId: Int,
  /**
   * Reference to the system operator.
   */
  @SerialName("system_operator_id")
  public val systemOperatorId: Int,
  /**
   * References to the product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Int>,
  /**
   * The status of the application.
   */
  @SerialName("status")
  public val status: ServiceProviderProductApplicationStatus,
  /**
   * When the product application was last validated.
   */
  @SerialName("qualified_at")
  public val qualifiedAt: Instant? = null,
  /**
   * When the resource was recorded (created or updated) in the system.
   */
  @SerialName("recorded_at")
  public val recordedAt: Instant? = null,
  /**
   * The identity that recorded the resource.
   */
  @SerialName("recorded_by")
  public val recordedBy: Int? = null,
)
