package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The reason for the suspension.
 */
public enum class ControllableUnitSuspensionReason(
  public val `value`: String,
) {
  @SerialName("compromises_safe_operation")
  COMPROMISES_SAFE_OPERATION("compromises_safe_operation"),
  @SerialName("other")
  OTHER("other"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ControllableUnitSuspensionReason> =
        entries.associateBy(ControllableUnitSuspensionReason::value)

    public fun fromValue(`value`: String): ControllableUnitSuspensionReason? = mapping[value]
  }
}
