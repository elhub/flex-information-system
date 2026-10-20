package no.elhub.flex.integration.adapter.generated.models

import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class MeteringGridAreaPriceArea(
  /**
   * Norwegian price area
   */
  @SerialName("price_area")
  public val priceArea: PriceArea,
  /**
   * Start of the validity period
   */
  @SerialName("valid_from")
  public val validFrom: Instant,
  /**
   * End of the validity period
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
)
