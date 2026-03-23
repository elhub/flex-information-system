package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Technical unit being part of a controllable unit.
 */
@Serializable
public data class TechnicalResourceResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
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
  /**
   * When the resource was recorded (created or updated) in the system.
   */
  @SerialName("recorded_at")
  public val recordedAt: Instant? = null,
  /**
   * The identity that recorded the resource.
   */
  @SerialName("recorded_by")
  public val recordedBy: Int? = null,
)
