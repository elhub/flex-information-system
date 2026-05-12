package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Identifies the notice data schema for discriminated union deserialization.
 */
public enum class NoticeDataPartyOutdatedType(
  public val `value`: String,
) {
  @SerialName("notice.data.party.outdated")
  NOTICE_DATA_PARTY_OUTDATED("notice.data.party.outdated"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, NoticeDataPartyOutdatedType> =
        entries.associateBy(NoticeDataPartyOutdatedType::value)

    public fun fromValue(`value`: String): NoticeDataPartyOutdatedType? = mapping[value]
  }
}
