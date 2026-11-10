package no.elhub.flex.auth.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Error message returned from the API for oAuth errors.
 */
@Serializable
public data class OauthErrorMessage(
  /**
   * The error code.
   */
  @SerialName("error")
  public val error: String? = null,
  /**
   * Detailed information about the error.
   */
  @SerialName("error_description")
  public val errorDescription: String? = null,
  /**
   * A URL to a page with information about the error code.
   */
  @SerialName("error_uri")
  public val errorUri: String? = null,
  /**
   * The scope of the error.
   */
  @SerialName("scope")
  public val scope: String? = null,
)
