package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Identifies the notice type for discriminated union deserialization.
 */
public enum class NoticeDataProductTypeNotQualifiedNoticeType(
  public val `value`: String,
) {
  @SerialName("no.elhub.flex.service_provider_product_suspension.product_type.not_qualified")
  NO_ELHUB_FLEX_SERVICE_PROVIDER_PRODUCT_SUSPENSION_PRODUCT_TYPE_NOT_QUALIFIED("no.elhub.flex.service_provider_product_suspension.product_type.not_qualified"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, NoticeDataProductTypeNotQualifiedNoticeType> =
        entries.associateBy(NoticeDataProductTypeNotQualifiedNoticeType::value)

    public fun fromValue(`value`: String): NoticeDataProductTypeNotQualifiedNoticeType? =
        mapping[value]
  }
}
