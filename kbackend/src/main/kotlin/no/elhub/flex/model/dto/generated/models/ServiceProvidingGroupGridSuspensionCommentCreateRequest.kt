package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Comment made by a party involved in a service providing
 * group grid suspension.
 */
@Serializable
public data class ServiceProvidingGroupGridSuspensionCommentCreateRequest(
  /**
   * Reference to the service providing group grid suspension.
   */
  @SerialName("service_providing_group_grid_suspension_id")
  public val serviceProvidingGroupGridSuspensionId: Int,
  /**
   * The level of visibility of the comment.
   */
  @SerialName("visibility")
  public val visibility: ServiceProvidingGroupGridSuspensionCommentVisibility =
      ServiceProvidingGroupGridSuspensionCommentVisibility.SAME_PARTY,
  /**
   * Free text content of the comment.
   */
  @SerialName("content")
  public val content: String,
)
