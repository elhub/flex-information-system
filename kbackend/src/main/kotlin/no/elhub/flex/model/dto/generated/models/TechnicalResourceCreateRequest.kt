package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Technical unit being part of a controllable unit.
 */
@Serializable
public data class TechnicalResourceCreateRequest(
  /**
   * Name of the technical resource. Maximum 128 characters.
   */
  @SerialName("name")
  public val name: String,
  /**
   * Reference to the controllable unit that this technical resource belongs to.
   */
  @SerialName("controllable_unit_id")
  public val controllableUnitId: Int,
  /**
   * Free text details about the technical resource.
   */
  @SerialName("details")
  public val details: String? = null,
)
