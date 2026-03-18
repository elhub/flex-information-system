package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The grid validation status of the controllable unit.
 */
public enum class ControllableUnitGridValidationStatus(
  public val `value`: String,
) {
  @SerialName("pending")
  PENDING("pending"),
  @SerialName("in_progress")
  IN_PROGRESS("in_progress"),
  @SerialName("incomplete_information")
  INCOMPLETE_INFORMATION("incomplete_information"),
  @SerialName("validated")
  VALIDATED("validated"),
  @SerialName("validation_failed")
  VALIDATION_FAILED("validation_failed"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ControllableUnitGridValidationStatus> =
        entries.associateBy(ControllableUnitGridValidationStatus::value)

    public fun fromValue(`value`: String): ControllableUnitGridValidationStatus? = mapping[value]
  }
}
