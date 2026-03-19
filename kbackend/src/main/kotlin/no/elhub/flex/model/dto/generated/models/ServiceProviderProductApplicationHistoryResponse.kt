package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Service Provider Product Application - history
 */
@Serializable
public data class ServiceProviderProductApplicationHistoryResponse(
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
  /**
   * Reference to the resource that was updated.
   */
  @SerialName("service_provider_product_application_id")
  public val serviceProviderProductApplicationId: Int,
  /**
   * The identity that updated the resource when it was replaced.
   */
  @SerialName("replaced_by")
  public val replacedBy: Int? = null,
  /**
   * When the resource was replaced in the system.
   */
  @SerialName("replaced_at")
  public val replacedAt: Instant? = null,
)
