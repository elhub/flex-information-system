package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The bidding zone that restricts which CUs that can be added to the group. Also known as
 * scheduling area or price area for TSO.
 */
public enum class ServiceProvidingGroupBiddingZone(
  public val `value`: String,
) {
  @SerialName("NO1")
  NO1("NO1"),
  @SerialName("NO2")
  NO2("NO2"),
  @SerialName("NO3")
  NO3("NO3"),
  @SerialName("NO4")
  NO4("NO4"),
  @SerialName("NO5")
  NO5("NO5"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ServiceProvidingGroupBiddingZone> =
        entries.associateBy(ServiceProvidingGroupBiddingZone::value)

    public fun fromValue(`value`: String): ServiceProvidingGroupBiddingZone? = mapping[value]
  }
}
