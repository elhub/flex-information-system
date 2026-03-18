package no.elhub.flex.model.dto.generated.models

import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Format of the data field in a notice of type no.elhub.flex.*.valid_time.outside_contract
 */
@SerialName("notice_data_valid_time_outside_contract")
@Serializable
public data class NoticeDataValidTimeOutsideContract(
  /**
   * Partial timeline data that is relevant to mention, in a notice for instance. Multirange format,
   * i.e., array of start/end timestamp pairs.
   */
  @SerialName("invalid_timeline")
  public val invalidTimeline: List<NoticeDataValidTimeOutsideContractTimelineMultiRange>? = null,
) : NoticeData
