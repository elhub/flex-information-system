package no.elhub.flex.integration.accountingpointadapter.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Type of the end user entity, either a person or an organisation.
 */
public enum class EndUserEntityType(
  public val `value`: String,
) {
  @SerialName("person")
  PERSON("person"),
  @SerialName("organisation")
  ORGANISATION("organisation"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, EndUserEntityType> =
        entries.associateBy(EndUserEntityType::value)

    public fun fromValue(`value`: String): EndUserEntityType? = mapping[value]
  }
}
