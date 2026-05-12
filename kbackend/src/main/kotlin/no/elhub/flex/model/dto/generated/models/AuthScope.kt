package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Authorization scopes.
 */
public enum class AuthScope(
  public val `value`: String,
) {
  @SerialName("read:data")
  READ_DATA("read:data"),
  @SerialName("use:data")
  USE_DATA("use:data"),
  @SerialName("use:data:entity:lookup")
  USE_DATA_ENTITY_LOOKUP("use:data:entity:lookup"),
  @SerialName("manage:data")
  MANAGE_DATA("manage:data"),
  @SerialName("manage:data:party_membership")
  MANAGE_DATA_PARTY_MEMBERSHIP("manage:data:party_membership"),
  @SerialName("manage:data:entity_client")
  MANAGE_DATA_ENTITY_CLIENT("manage:data:entity_client"),
  @SerialName("read:auth")
  READ_AUTH("read:auth"),
  @SerialName("use:auth")
  USE_AUTH("use:auth"),
  @SerialName("manage:auth")
  MANAGE_AUTH("manage:auth"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, AuthScope> = entries.associateBy(AuthScope::value)

    public fun fromValue(`value`: String): AuthScope? = mapping[value]
  }
}
