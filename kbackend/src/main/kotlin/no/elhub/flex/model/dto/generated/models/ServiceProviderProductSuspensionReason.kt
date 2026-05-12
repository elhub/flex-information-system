package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The reason for the suspension.
 */
public enum class ServiceProviderProductSuspensionReason(
  public val `value`: String,
) {
  @SerialName("communication_issues")
  COMMUNICATION_ISSUES("communication_issues"),
  @SerialName("failing_heartbeat")
  FAILING_HEARTBEAT("failing_heartbeat"),
  @SerialName("system_issues")
  SYSTEM_ISSUES("system_issues"),
  @SerialName("clearing_issues")
  CLEARING_ISSUES("clearing_issues"),
  @SerialName("breach_of_conditions")
  BREACH_OF_CONDITIONS("breach_of_conditions"),
  @SerialName("other")
  OTHER("other"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ServiceProviderProductSuspensionReason> =
        entries.associateBy(ServiceProviderProductSuspensionReason::value)

    public fun fromValue(`value`: String): ServiceProviderProductSuspensionReason? = mapping[value]
  }
}
