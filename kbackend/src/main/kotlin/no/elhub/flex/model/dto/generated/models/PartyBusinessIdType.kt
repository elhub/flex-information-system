package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of the business identifier.
 */
public enum class PartyBusinessIdType(
  public val `value`: String,
) {
  @SerialName("gln")
  GLN("gln"),
  @SerialName("uuid")
  UUID("uuid"),
  @SerialName("eic_x")
  EIC_X("eic_x"),
  @SerialName("org")
  ORG("org"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, PartyBusinessIdType> =
        entries.associateBy(PartyBusinessIdType::value)

    public fun fromValue(`value`: String): PartyBusinessIdType? = mapping[value]
  }
}
