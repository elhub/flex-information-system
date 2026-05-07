package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The status of the metering grid area.
 */
public enum class MeteringGridAreaStatus(
  public val `value`: String,
) {
  @SerialName("active")
  ACTIVE("active"),
  @SerialName("inactive")
  INACTIVE("inactive"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, MeteringGridAreaStatus> =
        entries.associateBy(MeteringGridAreaStatus::value)

    public fun fromValue(`value`: String): MeteringGridAreaStatus? = mapping[value]
  }
}
