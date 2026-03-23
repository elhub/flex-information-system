package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Metering grid area to which accounting points belong.
 */
@Serializable
public data class MeteringGridAreaResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * The business identifier of the metering grid area. Format depends on `business_id_type`.
   */
  @SerialName("business_id")
  public val businessId: String? = null,
  /**
   * The type of the business identifier.
   */
  @SerialName("business_id_type")
  public val businessIdType: MeteringGridAreaBusinessIdType? = null,
  /**
   * The name of the metering grid area.
   */
  @SerialName("name")
  public val name: String? = null,
)
