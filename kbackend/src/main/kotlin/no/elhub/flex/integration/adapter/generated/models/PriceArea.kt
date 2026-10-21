package no.elhub.flex.integration.adapter.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Norwegian price area
 */
public enum class PriceArea(
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
    private val mapping: Map<String, PriceArea> = entries.associateBy(PriceArea::value)

    public fun fromValue(`value`: String): PriceArea? = mapping[value]
  }
}
