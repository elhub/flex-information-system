package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Comment made by a party involved in a service provider
 * product application.
 */
@Serializable
public data class ServiceProviderProductApplicationCommentCreateRequest(
  /**
   * Reference to the service provider product application.
   */
  @SerialName("service_provider_product_application_id")
  public val serviceProviderProductApplicationId: Int,
  /**
   * The level of visibility of the comment.
   */
  @SerialName("visibility")
  public val visibility: ServiceProviderProductApplicationCommentVisibility =
      ServiceProviderProductApplicationCommentVisibility.SAME_PARTY,
  /**
   * Free text content of the comment.
   */
  @SerialName("content")
  public val content: String,
)
