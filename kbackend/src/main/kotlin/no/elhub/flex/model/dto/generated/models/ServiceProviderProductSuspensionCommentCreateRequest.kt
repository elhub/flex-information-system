package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Comment made by a party involved in a service provider
 * product suspension.
 */
@Serializable
public data class ServiceProviderProductSuspensionCommentCreateRequest(
  /**
   * Reference to the service provider product suspension.
   */
  @SerialName("service_provider_product_suspension_id")
  public val serviceProviderProductSuspensionId: Long,
  /**
   * The level of visibility of the comment.
   */
  @SerialName("visibility")
  public val visibility: ServiceProviderProductSuspensionCommentVisibility =
      ServiceProviderProductSuspensionCommentVisibility.SAME_PARTY,
  /**
   * Free text content of the comment.
   */
  @SerialName("content")
  public val content: String,
)
