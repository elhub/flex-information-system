package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The status of the grid prequalification for this service providing group.
 */
public enum class ServiceProvidingGroupGridPrequalificationStatus(
  public val `value`: String,
) {
  @SerialName("requested")
  REQUESTED("requested"),
  @SerialName("in_progress")
  IN_PROGRESS("in_progress"),
  @SerialName("conditionally_approved")
  CONDITIONALLY_APPROVED("conditionally_approved"),
  @SerialName("approved")
  APPROVED("approved"),
  @SerialName("not_approved")
  NOT_APPROVED("not_approved"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ServiceProvidingGroupGridPrequalificationStatus> =
        entries.associateBy(ServiceProvidingGroupGridPrequalificationStatus::value)

    public fun fromValue(`value`: String): ServiceProvidingGroupGridPrequalificationStatus? =
        mapping[value]
  }
}
