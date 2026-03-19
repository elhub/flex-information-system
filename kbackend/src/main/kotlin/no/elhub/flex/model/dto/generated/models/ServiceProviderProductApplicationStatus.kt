package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The status of the application.
 */
public enum class ServiceProviderProductApplicationStatus(
  public val `value`: String,
) {
  @SerialName("requested")
  REQUESTED("requested"),
  @SerialName("in_progress")
  IN_PROGRESS("in_progress"),
  @SerialName("communication_test")
  COMMUNICATION_TEST("communication_test"),
  @SerialName("not_qualified")
  NOT_QUALIFIED("not_qualified"),
  @SerialName("qualified")
  QUALIFIED("qualified"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ServiceProviderProductApplicationStatus> =
        entries.associateBy(ServiceProviderProductApplicationStatus::value)

    public fun fromValue(`value`: String): ServiceProviderProductApplicationStatus? = mapping[value]
  }
}
