package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * MIME type of the attachment.
 */
public enum class ServiceProvidingGroupProductApplicationAttachmentContentType(
  public val `value`: String,
) {
  @SerialName("application/pdf")
  APPLICATION_PDF("application/pdf"),
  @SerialName("image/jpeg")
  IMAGE_JPEG("image/jpeg"),
  @SerialName("image/png")
  IMAGE_PNG("image/png"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ServiceProvidingGroupProductApplicationAttachmentContentType> =
        entries.associateBy(ServiceProvidingGroupProductApplicationAttachmentContentType::value)

    public fun fromValue(`value`: String):
        ServiceProvidingGroupProductApplicationAttachmentContentType? = mapping[value]
  }
}
