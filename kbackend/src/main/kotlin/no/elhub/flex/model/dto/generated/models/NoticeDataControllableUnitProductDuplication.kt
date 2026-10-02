package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Format of the data field in a notice with data.kind =
 * notice.data.controllable_unit.product_duplication
 */
@SerialName("notice.data.controllable_unit.product_duplication")
@Serializable
public data class NoticeDataControllableUnitProductDuplication(
  /**
   * The product type for which the controllable unit is registered in multiple service providing
   * groups with active applications.
   */
  @SerialName("product_type_id")
  public val productTypeId: Long? = null,
  /**
   * The service providing groups the controllable unit is a member of that have active applications
   * for the product type.
   */
  @SerialName("service_providing_group_ids")
  public val serviceProvidingGroupIds: List<Long>? = null,
) : NoticeData
