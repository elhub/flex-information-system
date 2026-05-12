package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The regulation direction of the controllable unit. `up` means it can be used to increase
 * production or decrease consumption, while `down` means to decrease production or increase
 * consumption.
 */
public enum class ControllableUnitRegulationDirection(
  public val `value`: String,
) {
  @SerialName("up")
  UP("up"),
  @SerialName("down")
  DOWN("down"),
  @SerialName("both")
  BOTH("both"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ControllableUnitRegulationDirection> =
        entries.associateBy(ControllableUnitRegulationDirection::value)

    public fun fromValue(`value`: String): ControllableUnitRegulationDirection? = mapping[value]
  }
}
