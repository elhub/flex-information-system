package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Technical unit being part of a controllable unit.
 */
@Serializable
public data class TechnicalResourceUpdateRequest(
  /**
   * Name of the technical resource. Maximum 128 characters.
   */
  @SerialName("name")
  public val name: String? = null,
  /**
   * Free text details about the technical resource.
   */
  @SerialName("details")
  public val details: String? = null,
)
