package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Controllable Unit Suspension Comment - history
 */
@Serializable
public data class ControllableUnitSuspensionCommentHistoryResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Reference to the controllable unit suspension.
   */
  @SerialName("controllable_unit_suspension_id")
  public val controllableUnitSuspensionId: Int,
  /**
   * Reference to the identity that created the comment.
   */
  @SerialName("created_by")
  public val createdBy: Int? = null,
  /**
   * When the comment was added to the CUS.
   */
  @SerialName("created_at")
  public val createdAt: Instant? = null,
  /**
   * The level of visibility of the comment.
   */
  @SerialName("visibility")
  public val visibility: ControllableUnitSuspensionCommentVisibility,
  /**
   * Free text content of the comment.
   */
  @SerialName("content")
  public val content: String,
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
  /**
   * Reference to the resource that was updated.
   */
  @SerialName("controllable_unit_suspension_comment_id")
  public val controllableUnitSuspensionCommentId: Int,
  /**
   * The identity that updated the resource when it was replaced.
   */
  @SerialName("replaced_by")
  public val replacedBy: Int? = null,
  /**
   * When the resource was replaced in the system.
   */
  @SerialName("replaced_at")
  public val replacedAt: Instant? = null,
)
