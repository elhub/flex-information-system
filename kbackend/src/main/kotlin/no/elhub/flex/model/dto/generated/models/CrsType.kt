package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

public enum class CrsType(
  public val `value`: String,
) {
  @SerialName("name")
  NAME("name"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, CrsType> = entries.associateBy(CrsType::value)

    public fun fromValue(`value`: String): CrsType? = mapping[value]
  }
}
