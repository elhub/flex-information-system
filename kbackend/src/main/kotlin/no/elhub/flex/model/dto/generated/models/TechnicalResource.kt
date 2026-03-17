package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A technical resource belonging to a controllable unit.
 */
@Serializable
public data class TechnicalResource(
  /**
   * Surrogate key of the technical resource.
   */
  @SerialName("id")
  public val id: Int,
  /**
   * Name of the technical resource.
   */
  @SerialName("name")
  public val name: String,
  /**
   * Additional details about the technical resource.
   */
  @SerialName("details")
  public val details: String? = null,
)
