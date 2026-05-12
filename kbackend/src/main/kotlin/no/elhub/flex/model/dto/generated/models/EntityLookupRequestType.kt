package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of the entity.
 */
public enum class EntityLookupRequestType(
  public val `value`: String,
) {
  @SerialName("person")
  PERSON("person"),
  @SerialName("organisation")
  ORGANISATION("organisation"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, EntityLookupRequestType> =
        entries.associateBy(EntityLookupRequestType::value)

    public fun fromValue(`value`: String): EntityLookupRequestType? = mapping[value]
  }
}
