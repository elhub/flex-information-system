package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The status of the notice.
 */
public enum class NoticeStatus(
  public val `value`: String,
) {
  @SerialName("active")
  ACTIVE("active"),
  @SerialName("resolved")
  RESOLVED("resolved"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, NoticeStatus> = entries.associateBy(NoticeStatus::value)

    public fun fromValue(`value`: String): NoticeStatus? = mapping[value]
  }
}
