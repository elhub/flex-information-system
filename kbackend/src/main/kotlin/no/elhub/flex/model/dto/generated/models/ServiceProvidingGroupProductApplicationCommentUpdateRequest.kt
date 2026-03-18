package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Comment made by a party involved in a service providing
 * group product application.
 */
@Serializable
public data class ServiceProvidingGroupProductApplicationCommentUpdateRequest(
  /**
   * The level of visibility of the comment.
   */
  @SerialName("visibility")
  public val visibility: ServiceProvidingGroupProductApplicationCommentVisibility =
      ServiceProvidingGroupProductApplicationCommentVisibility.SAME_PARTY,
  /**
   * Free text content of the comment.
   */
  @SerialName("content")
  public val content: String? = null,
)
