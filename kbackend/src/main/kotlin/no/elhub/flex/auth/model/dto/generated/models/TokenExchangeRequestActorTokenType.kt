package no.elhub.flex.auth.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of the token to exchange. Always JWT.
 */
public enum class TokenExchangeRequestActorTokenType(
  public val `value`: String,
) {
  @SerialName("urn:ietf:params:oauth:token-type:jwt")
  URN_IETF_PARAMS_OAUTH_TOKEN_TYPE_JWT("urn:ietf:params:oauth:token-type:jwt"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, TokenExchangeRequestActorTokenType> =
        entries.associateBy(TokenExchangeRequestActorTokenType::value)

    public fun fromValue(`value`: String): TokenExchangeRequestActorTokenType? = mapping[value]
  }
}
