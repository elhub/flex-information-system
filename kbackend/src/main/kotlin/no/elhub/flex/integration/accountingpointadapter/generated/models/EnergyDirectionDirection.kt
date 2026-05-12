package no.elhub.flex.integration.accountingpointadapter.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

public enum class EnergyDirectionDirection(
  public val `value`: String,
) {
  @SerialName("production")
  PRODUCTION("production"),
  @SerialName("consumption")
  CONSUMPTION("consumption"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, EnergyDirectionDirection> =
        entries.associateBy(EnergyDirectionDirection::value)

    public fun fromValue(`value`: String): EnergyDirectionDirection? = mapping[value]
  }
}
