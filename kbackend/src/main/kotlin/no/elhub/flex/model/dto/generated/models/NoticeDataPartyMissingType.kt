package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Identifies the notice data schema for discriminated union deserialization.
 */
public enum class NoticeDataPartyMissingType(
  public val `value`: String,
) {
  @SerialName("notice.data.party.missing")
  NOTICE_DATA_PARTY_MISSING("notice.data.party.missing"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, NoticeDataPartyMissingType> =
        entries.associateBy(NoticeDataPartyMissingType::value)

    public fun fromValue(`value`: String): NoticeDataPartyMissingType? = mapping[value]
  }
}
