package no.elhub.flex.integration.accountingpointadapter.generated.models

import kotlin.String
import kotlin.time.Instant
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
