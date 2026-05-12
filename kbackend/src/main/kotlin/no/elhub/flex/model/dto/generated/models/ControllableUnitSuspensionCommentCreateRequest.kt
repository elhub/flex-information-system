package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Comment made by a party involved in a controllable unit
 * suspension.
 */
@Serializable
public data class ControllableUnitSuspensionCommentCreateRequest(
  /**
   * Reference to the controllable unit suspension.
   */
  @SerialName("controllable_unit_suspension_id")
  public val controllableUnitSuspensionId: Long,
  /**
   * The level of visibility of the comment.
   */
  @SerialName("visibility")
  public val visibility: ControllableUnitSuspensionCommentVisibility =
      ControllableUnitSuspensionCommentVisibility.SAME_PARTY,
  /**
   * Free text content of the comment.
   */
  @SerialName("content")
  public val content: String,
)
