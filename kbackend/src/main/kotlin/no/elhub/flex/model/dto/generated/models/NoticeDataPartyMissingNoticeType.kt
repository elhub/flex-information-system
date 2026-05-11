package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Identifies the notice type for discriminated union deserialization.
 */
public enum class NoticeDataPartyMissingNoticeType(
  public val `value`: String,
) {
  @SerialName("no.elhub.flex.party.missing")
  NO_ELHUB_FLEX_PARTY_MISSING("no.elhub.flex.party.missing"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, NoticeDataPartyMissingNoticeType> =
        entries.associateBy(NoticeDataPartyMissingNoticeType::value)

    public fun fromValue(`value`: String): NoticeDataPartyMissingNoticeType? = mapping[value]
  }
}
