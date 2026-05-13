package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Identifies the notice data schema for discriminated union deserialization.
 */
public enum class NoticeDataProductTypeNotQualifiedType(
  public val `value`: String,
) {
  @SerialName("notice.data.product_type.not_qualified")
  NOTICE_DATA_PRODUCT_TYPE_NOT_QUALIFIED("notice.data.product_type.not_qualified"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, NoticeDataProductTypeNotQualifiedType> =
        entries.associateBy(NoticeDataProductTypeNotQualifiedType::value)

    public fun fromValue(`value`: String): NoticeDataProductTypeNotQualifiedType? = mapping[value]
  }
}
