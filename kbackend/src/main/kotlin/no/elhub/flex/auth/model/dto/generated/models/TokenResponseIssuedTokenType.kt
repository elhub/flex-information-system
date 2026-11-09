package no.elhub.flex.auth.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The format of the generated token. Always an access token.
 */
public enum class TokenResponseIssuedTokenType(
  public val `value`: String,
) {
  @SerialName("urn:ietf:params:oauth:token-type:access_token")
  URN_IETF_PARAMS_OAUTH_TOKEN_TYPE_ACCESS_TOKEN("urn:ietf:params:oauth:token-type:access_token"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, TokenResponseIssuedTokenType> =
        entries.associateBy(TokenResponseIssuedTokenType::value)

    public fun fromValue(`value`: String): TokenResponseIssuedTokenType? = mapping[value]
  }
}
