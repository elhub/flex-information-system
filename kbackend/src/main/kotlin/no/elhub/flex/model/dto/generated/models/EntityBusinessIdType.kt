package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of the business identifier.
 */
public enum class EntityBusinessIdType(
  public val `value`: String,
) {
  @SerialName("pid")
  PID("pid"),
  @SerialName("org")
  ORG("org"),
  @SerialName("email")
  EMAIL("email"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, EntityBusinessIdType> =
        entries.associateBy(EntityBusinessIdType::value)

    public fun fromValue(`value`: String): EntityBusinessIdType? = mapping[value]
  }
}
