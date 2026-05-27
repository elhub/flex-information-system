package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of business identifier. For persons, either `pid` (personnummer, 11 digits) or `email`.
 * For organisations, `org` (organisation number, 9 digits).
 */
public enum class EntityLookupRequestBusinessIdType(
  public val `value`: String,
) {
  @SerialName("pid")
  PID("pid"),
  @SerialName("email")
  EMAIL("email"),
  @SerialName("org")
  ORG("org"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, EntityLookupRequestBusinessIdType> =
        entries.associateBy(EntityLookupRequestBusinessIdType::value)

    public fun fromValue(`value`: String): EntityLookupRequestBusinessIdType? = mapping[value]
  }
}
