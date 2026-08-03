package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Service Providing Group Product Application Attachment - history
 */
@Serializable
public data class ServiceProvidingGroupProductApplicationAttachmentHistoryResponse(
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
   * Reference to the resource that was updated.
   */
  @SerialName("service_providing_group_product_application_attachment_id")
  public val serviceProvidingGroupProductApplicationAttachmentId: Long,
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
