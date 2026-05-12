package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Format of the data field in a notice of type
 * no.elhub.flex.service_provider_product_suspension.product_type.not_qualified
 */
@SerialName("notice.data.product_type.not_qualified")
@Serializable
public data class NoticeDataProductTypeNotQualified(
  /**
   * List of product types that are not qualified.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Long>? = null,
) : NoticeData
