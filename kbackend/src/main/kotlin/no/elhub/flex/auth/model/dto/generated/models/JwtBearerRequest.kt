package no.elhub.flex.auth.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * JWT Bearer authorization grant request
 */
@Serializable
public data class JwtBearerRequest(
  /**
   * The grant type for JWT Bearer authorization grant requests.
   */
  @SerialName("grant_type")
  public val grantType: JwtBearerRequestGrantType,
  /**
   * The JWT grant to exchange for an access token.
   */
  @SerialName("assertion")
  public val assertion: String,
)
