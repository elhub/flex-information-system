package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The status of the group.
 */
public enum class ServiceProvidingGroupStatus(
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
    private val mapping: Map<String, ServiceProvidingGroupStatus> =
        entries.associateBy(ServiceProvidingGroupStatus::value)

    public fun fromValue(`value`: String): ServiceProvidingGroupStatus? = mapping[value]
  }
}
