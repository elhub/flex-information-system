package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of business identifier used for the device.
 */
public enum class TechnicalResourceBusinessIdType(
  public val `value`: String,
) {
  @SerialName("serial_number")
  SERIAL_NUMBER("serial_number"),
  @SerialName("mac")
  MAC("mac"),
  @SerialName("other")
  OTHER("other"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, TechnicalResourceBusinessIdType> =
        entries.associateBy(TechnicalResourceBusinessIdType::value)

    public fun fromValue(`value`: String): TechnicalResourceBusinessIdType? = mapping[value]
  }
}
