package no.elhub.flex.shared.adapter.generated.models

import kotlin.Boolean
import kotlin.String
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class MeteringGridArea(
  /**
   * Business ID of the metering grid area. EIC-Y format.
   */
  @SerialName("business_id")
  public val businessId: String,
  /**
   * Name of the metering grid area
   */
  @SerialName("name")
  public val name: String,
  /**
   * Whether the MGA is active
   */
  @SerialName("is_active")
  public val isActive: Boolean,
  @SerialName("system_operator")
  public val systemOperator: List<MeteringGridAreaSystemOperator>,
  @SerialName("price_area")
  public val priceArea: List<MeteringGridAreaPriceArea>,
)
