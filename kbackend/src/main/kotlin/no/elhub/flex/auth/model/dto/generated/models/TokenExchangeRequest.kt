package no.elhub.flex.auth.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Token exchange body
 */
@Serializable
public data class TokenExchangeRequest(
  /**
   * The grant type of the request signals which step of the login process we want to use.
   */
  @SerialName("grant_type")
  public val grantType: TokenExchangeRequestGrantType,
  /**
   * The token to exchange, obtained during the preceding authentication step.
   */
  @SerialName("actor_token")
  public val actorToken: String,
  /**
   * The type of the token to exchange. Always JWT.
   */
  @SerialName("actor_token_type")
  public val actorTokenType: TokenExchangeRequestActorTokenType,
  /**
   * The party the client wants to assume.
   */
  @SerialName("scope")
  public val scope: String,
)
