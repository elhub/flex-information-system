package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The reason for the suspension.
 */
public enum class ServiceProvidingGroupGridSuspensionReason(
  public val `value`: String,
) {
  @SerialName("breach_of_conditions")
  BREACH_OF_CONDITIONS("breach_of_conditions"),
  @SerialName("significant_group_change")
  SIGNIFICANT_GROUP_CHANGE("significant_group_change"),
  @SerialName("other")
  OTHER("other"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ServiceProvidingGroupGridSuspensionReason> =
        entries.associateBy(ServiceProvidingGroupGridSuspensionReason::value)

    public fun fromValue(`value`: String): ServiceProvidingGroupGridSuspensionReason? =
        mapping[value]
  }
}
