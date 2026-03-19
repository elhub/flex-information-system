package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The status of the application.
 */
public enum class ServiceProvidingGroupProductApplicationStatus(
  public val `value`: String,
) {
  @SerialName("requested")
  REQUESTED("requested"),
  @SerialName("prequalification_pending")
  PREQUALIFICATION_PENDING("prequalification_pending"),
  @SerialName("in_progress")
  IN_PROGRESS("in_progress"),
  @SerialName("temporary_qualified")
  TEMPORARY_QUALIFIED("temporary_qualified"),
  @SerialName("prequalified")
  PREQUALIFIED("prequalified"),
  @SerialName("verified")
  VERIFIED("verified"),
  @SerialName("rejected")
  REJECTED("rejected"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ServiceProvidingGroupProductApplicationStatus> =
        entries.associateBy(ServiceProvidingGroupProductApplicationStatus::value)

    public fun fromValue(`value`: String): ServiceProvidingGroupProductApplicationStatus? =
        mapping[value]
  }
}
