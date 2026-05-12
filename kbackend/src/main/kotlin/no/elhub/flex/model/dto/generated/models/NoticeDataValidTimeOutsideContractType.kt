package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Identifies the notice data schema for discriminated union deserialization.
 */
public enum class NoticeDataValidTimeOutsideContractType(
  public val `value`: String,
) {
  @SerialName("notice.data.valid_time.outside_contract")
  NOTICE_DATA_VALID_TIME_OUTSIDE_CONTRACT("notice.data.valid_time.outside_contract"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, NoticeDataValidTimeOutsideContractType> =
        entries.associateBy(NoticeDataValidTimeOutsideContractType::value)

    public fun fromValue(`value`: String): NoticeDataValidTimeOutsideContractType? = mapping[value]
  }
}
