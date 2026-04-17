package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Comment made by a party involved in a service provider product suspension.
 */
@Serializable
public data class ServiceProviderProductSuspensionCommentResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Reference to the service provider product suspension.
   */
  @SerialName("service_provider_product_suspension_id")
  public val serviceProviderProductSuspensionId: Long,
  /**
   * Reference to the identity that created the comment.
   */
  @SerialName("created_by")
  public val createdBy: Long? = null,
  /**
   * When the comment was added to the SPPS.
   */
  @SerialName("created_at")
  public val createdAt: Instant? = null,
  /**
   * The level of visibility of the comment.
   */
  @SerialName("visibility")
  public val visibility: ServiceProviderProductSuspensionCommentVisibility,
  /**
   * Free text content of the comment.
   */
  @SerialName("content")
  public val content: String,
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
)
