package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The status of the controllable unit.
 */
public enum class ControllableUnitStatus(
  public val `value`: String,
) {
  @SerialName("new")
  NEW("new"),
  @SerialName("active")
  ACTIVE("active"),
  @SerialName("inactive")
  INACTIVE("inactive"),
  @SerialName("terminated")
  TERMINATED("terminated"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ControllableUnitStatus> =
        entries.associateBy(ControllableUnitStatus::value)

    public fun fromValue(`value`: String): ControllableUnitStatus? = mapping[value]
  }
}
