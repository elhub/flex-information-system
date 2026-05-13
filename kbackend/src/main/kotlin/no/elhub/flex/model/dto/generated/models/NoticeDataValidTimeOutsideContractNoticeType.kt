package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Identifies the notice type for discriminated union deserialization.
 */
public enum class NoticeDataValidTimeOutsideContractNoticeType(
  public val `value`: String,
) {
  @SerialName("no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract")
  NO_ELHUB_FLEX_CONTROLLABLE_UNIT_SERVICE_PROVIDER_VALID_TIME_OUTSIDE_CONTRACT("no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, NoticeDataValidTimeOutsideContractNoticeType> =
        entries.associateBy(NoticeDataValidTimeOutsideContractNoticeType::value)

    public fun fromValue(`value`: String): NoticeDataValidTimeOutsideContractNoticeType? =
        mapping[value]
  }
}
