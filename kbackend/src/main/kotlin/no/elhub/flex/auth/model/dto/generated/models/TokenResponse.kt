package no.elhub.flex.auth.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Access token response
 */
@Serializable
public data class TokenResponse(
  /**
   * The generated token for use in subsequent requests.
   */
  @SerialName("access_token")
  public val accessToken: String,
  /**
   * The format of the generated token. Always an access token.
   */
  @SerialName("issued_token_type")
  public val issuedTokenType: TokenResponseIssuedTokenType,
  /**
   * The type of the token. Always `Bearer`.
   */
  @SerialName("token_type")
  public val tokenType: TokenResponseTokenType,
  /**
   * The time in seconds until the token expires.
   */
  @SerialName("expires_in")
  public val expiresIn: Int,
)
