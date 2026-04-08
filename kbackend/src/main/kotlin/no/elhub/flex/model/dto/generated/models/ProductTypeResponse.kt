package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Product type.
 */
@Serializable
public data class ProductTypeResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * The code for this product type.
   */
  @SerialName("business_id")
  public val businessId: String? = null,
  /**
   * The name of the product type.
   */
  @SerialName("name")
  public val name: String? = null,
  /**
   * The service offered by the product type.
   */
  @SerialName("service")
  public val service: String? = null,
  /**
   * Examples of products belonging to this product type.
   */
  @SerialName("products")
  public val products: String? = null,
)
