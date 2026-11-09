package no.elhub.flex.auth.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The grant type of the request signals which step of the login process we want to use.
 */
public enum class TokenExchangeRequestGrantType(
  public val `value`: String,
) {
  @SerialName("urn:ietf:params:oauth:grant-type:token-exchange")
  URN_IETF_PARAMS_OAUTH_GRANT_TYPE_TOKEN_EXCHANGE("urn:ietf:params:oauth:grant-type:token-exchange"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, TokenExchangeRequestGrantType> =
        entries.associateBy(TokenExchangeRequestGrantType::value)

    public fun fromValue(`value`: String): TokenExchangeRequestGrantType? = mapping[value]
  }
}
