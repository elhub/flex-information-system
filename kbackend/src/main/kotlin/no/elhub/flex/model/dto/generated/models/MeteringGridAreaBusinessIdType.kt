package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of the business identifier.
 */
public enum class MeteringGridAreaBusinessIdType(
  public val `value`: String,
) {
  @SerialName("eic_y")
  EIC_Y("eic_y"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, MeteringGridAreaBusinessIdType> =
        entries.associateBy(MeteringGridAreaBusinessIdType::value)

    public fun fromValue(`value`: String): MeteringGridAreaBusinessIdType? = mapping[value]
  }
}
