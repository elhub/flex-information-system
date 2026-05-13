package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Identifies the notice type for discriminated union deserialization.
 */
public enum class NoticeDataPartyOutdatedNoticeType(
  public val `value`: String,
) {
  @SerialName("no.elhub.flex.party.outdated")
  NO_ELHUB_FLEX_PARTY_OUTDATED("no.elhub.flex.party.outdated"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, NoticeDataPartyOutdatedNoticeType> =
        entries.associateBy(NoticeDataPartyOutdatedNoticeType::value)

    public fun fromValue(`value`: String): NoticeDataPartyOutdatedNoticeType? = mapping[value]
  }
}
