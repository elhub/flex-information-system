package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

public enum class PropertiesName(
  public val `value`: String,
) {
  @SerialName("EPSG:4326")
  EPSG_4326("EPSG:4326"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, PropertiesName> = entries.associateBy(PropertiesName::value)

    public fun fromValue(`value`: String): PropertiesName? = mapping[value]
  }
}
