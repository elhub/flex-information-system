package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - File attachment associated with a service providing group product application,
 * allowing involved parties to exchange supporting documents.
 */
@Serializable
public data class ServiceProvidingGroupProductApplicationAttachmentResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Reference to the service providing group product application.
   */
  @SerialName("service_providing_group_product_application_id")
  public val serviceProvidingGroupProductApplicationId: Long,
  /**
   * Identifier of the object to which the attachment is linked.
   */
  @SerialName("object_id")
  public val objectId: String,
  /**
   * Original filename of the attachment.
   */
  @SerialName("filename")
  public val filename: String,
  /**
   * Sanitised filename safe for storage.
   */
  @SerialName("filename_sanitised")
  public val filenameSanitised: String,
  /**
   * MIME type of the attachment.
   */
  @SerialName("content_type")
  public val contentType: ServiceProvidingGroupProductApplicationAttachmentContentType,
  /**
   * Size of the attachment in bytes.
   */
  @SerialName("size_bytes")
  public val sizeBytes: Long,
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
   * Response schema - Relation between a service providing group and a system operator for a
   * product type, for the SPG to deliver a product to the SO later.
   */
  @SerialName("service_providing_group_product_application")
  public val serviceProvidingGroupProductApplication:
      ServiceProvidingGroupProductApplicationResponse? = null,
)
