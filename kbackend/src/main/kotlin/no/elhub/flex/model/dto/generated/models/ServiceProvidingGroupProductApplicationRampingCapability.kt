package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The ramping capability of the service providing group for this product application.
 */
public enum class ServiceProvidingGroupProductApplicationRampingCapability(
  public val `value`: String,
) {
  @SerialName("always")
  ALWAYS("always"),
  @SerialName("partial")
  PARTIAL("partial"),
  @SerialName("never")
  NEVER("never"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ServiceProvidingGroupProductApplicationRampingCapability> =
        entries.associateBy(ServiceProvidingGroupProductApplicationRampingCapability::value)

    public fun fromValue(`value`: String): ServiceProvidingGroupProductApplicationRampingCapability?
        = mapping[value]
  }
}
