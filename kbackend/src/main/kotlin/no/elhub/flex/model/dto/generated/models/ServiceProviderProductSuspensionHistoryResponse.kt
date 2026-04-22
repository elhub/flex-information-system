package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Service Provider Product Suspension - history
 */
@Serializable
public data class ServiceProviderProductSuspensionHistoryResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Reference to the procuring system operator suspending the service provider.
   */
  @SerialName("procuring_system_operator_id")
  public val procuringSystemOperatorId: Long,
  /**
   * Reference to the service provider being suspended.
   */
  @SerialName("service_provider_id")
  public val serviceProviderId: Long,
  /**
   * References to the suspended product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Long>,
  /**
   * The reason for the suspension.
   */
  @SerialName("reason")
  public val reason: ServiceProviderProductSuspensionReason,
  /**
   * When the resource was recorded (created or updated) in the system.
   */
  @SerialName("recorded_at")
  public val recordedAt: Instant? = null,
  /**
   * The identity that recorded the resource.
   */
  @SerialName("recorded_by")
  public val recordedBy: Long? = null,
  /**
   * Response schema - The body that interacts with the Flexibility Information System
   *
   * A party is the thing that is authorized to access or modify data in the Flexiblity Information
   * System.
   *
   * Example party types:
   *
   * * Service Provider
   * * System Operator
   * * End User
   */
  @SerialName("procuring_system_operator")
  public val procuringSystemOperator: PartyResponse? = null,
  /**
   * Response schema - The body that interacts with the Flexibility Information System
   *
   * A party is the thing that is authorized to access or modify data in the Flexiblity Information
   * System.
   *
   * Example party types:
   *
   * * Service Provider
   * * System Operator
   * * End User
   */
  @SerialName("service_provider")
  public val serviceProvider: PartyResponse? = null,
  /**
   * Response schema - Comment made by a party involved in a service provider product suspension.
   */
  @SerialName("comment")
  public val comment: ServiceProviderProductSuspensionCommentResponse? = null,
  /**
   * Reference to the resource that was updated.
   */
  @SerialName("service_provider_product_suspension_id")
  public val serviceProviderProductSuspensionId: Long,
  /**
   * The identity that updated the resource when it was replaced.
   */
  @SerialName("replaced_by")
  public val replacedBy: Long? = null,
  /**
   * When the resource was replaced in the system.
   */
  @SerialName("replaced_at")
  public val replacedAt: Instant? = null,
)
