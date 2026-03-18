package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Error message returned from the API.
 */
@Serializable
public data class ErrorMessage(
  /**
   * The error code.
   */
  @SerialName("code")
  public val code: String,
  /**
   * Detailed information about the error.
   */
  @SerialName("details")
  public val details: String? = null,
  /**
   * A hint to help resolve the error.
   */
  @SerialName("hint")
  public val hint: String? = null,
  /**
   * The error message.
   */
  @SerialName("message")
  public val message: String,
)
