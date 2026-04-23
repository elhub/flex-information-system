package no.elhub.flex.model.dto.generated.models

import kotlin.Any
import kotlin.Long
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - The relation allowing a procuring system operator to temporarily suspend a
 * service provider from delivering them products of the given types.
 */
@Serializable
public data class ServiceProviderProductSuspensionResponse(
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
   * Embedded service_provider_product_suspension_comment
   */
  @SerialName("comment")
  public val comment: Any? = null,
)
