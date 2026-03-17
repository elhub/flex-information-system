package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Error response body
 */
@Serializable
public data class ErrorMessage(
  /**
   * Short machine-readable error code, e.g. "HTTP400".
   */
  @SerialName("code")
  public val code: String,
  /**
   * Human-readable description of the error.
   */
  @SerialName("message")
  public val message: String,
  /**
   * Optional extended detail.
   */
  @SerialName("details")
  public val details: String? = null,
  /**
   * Optional hint for the caller.
   */
  @SerialName("hint")
  public val hint: String? = null,
)
