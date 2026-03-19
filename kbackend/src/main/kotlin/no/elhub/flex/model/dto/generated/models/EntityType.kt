package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of the entity, e.g Person, Organisation
 */
public enum class EntityType(
  public val `value`: String,
) {
  @SerialName("person")
  PERSON("person"),
  @SerialName("organisation")
  ORGANISATION("organisation"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, EntityType> = entries.associateBy(EntityType::value)

    public fun fromValue(`value`: String): EntityType? = mapping[value]
  }
}
