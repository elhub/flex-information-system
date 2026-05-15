package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

public enum class ApiVersion(
  public val `value`: String,
) {
  @SerialName("2026-06-08")
  `2026_06_08`("2026-06-08"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ApiVersion> = entries.associateBy(ApiVersion::value)

    public fun fromValue(`value`: String): ApiVersion? = mapping[value]
  }
}
