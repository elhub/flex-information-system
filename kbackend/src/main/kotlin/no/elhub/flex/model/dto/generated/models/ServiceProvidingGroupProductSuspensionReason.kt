package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The reason for the suspension.
 */
public enum class ServiceProvidingGroupProductSuspensionReason(
  public val `value`: String,
) {
  @SerialName("failed_verification")
  FAILED_VERIFICATION("failed_verification"),
  @SerialName("other")
  OTHER("other"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ServiceProvidingGroupProductSuspensionReason> =
        entries.associateBy(ServiceProvidingGroupProductSuspensionReason::value)

    public fun fromValue(`value`: String): ServiceProvidingGroupProductSuspensionReason? =
        mapping[value]
  }
}
