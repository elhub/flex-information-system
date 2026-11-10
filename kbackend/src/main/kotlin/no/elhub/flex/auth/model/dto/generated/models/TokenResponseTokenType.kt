package no.elhub.flex.auth.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of the token. Always `Bearer`.
 */
public enum class TokenResponseTokenType(
  public val `value`: String,
) {
  @SerialName("Bearer")
  BEARER("Bearer"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, TokenResponseTokenType> =
        entries.associateBy(TokenResponseTokenType::value)

    public fun fromValue(`value`: String): TokenResponseTokenType? = mapping[value]
  }
}
