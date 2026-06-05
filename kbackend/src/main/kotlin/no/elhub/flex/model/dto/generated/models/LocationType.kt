package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

public enum class LocationType(
  public val `value`: String,
) {
  @SerialName("Point")
  POINT("Point"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, LocationType> = entries.associateBy(LocationType::value)

    public fun fromValue(`value`: String): LocationType? = mapping[value]
  }
}
