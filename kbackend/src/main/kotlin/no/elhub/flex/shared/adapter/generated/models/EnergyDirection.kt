package no.elhub.flex.shared.adapter.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

public enum class EnergyDirection(
  public val `value`: String,
) {
  @SerialName("production")
  PRODUCTION("production"),
  @SerialName("consumption")
  CONSUMPTION("consumption"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, EnergyDirection> = entries.associateBy(EnergyDirection::value)

    public fun fromValue(`value`: String): EnergyDirection? = mapping[value]
  }
}
