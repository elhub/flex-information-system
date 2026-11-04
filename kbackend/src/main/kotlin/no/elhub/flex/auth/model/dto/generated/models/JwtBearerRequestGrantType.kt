package no.elhub.flex.auth.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The grant type for JWT Bearer authorization grant requests.
 */
public enum class JwtBearerRequestGrantType(
  public val `value`: String,
) {
  @SerialName("urn:ietf:params:oauth:grant-type:jwt-bearer")
  URN_IETF_PARAMS_OAUTH_GRANT_TYPE_JWT_BEARER("urn:ietf:params:oauth:grant-type:jwt-bearer"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, JwtBearerRequestGrantType> =
        entries.associateBy(JwtBearerRequestGrantType::value)

    public fun fromValue(`value`: String): JwtBearerRequestGrantType? = mapping[value]
  }
}
