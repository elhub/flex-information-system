package no.elhub.flex.integration.accountingpointadapter.generated.models

import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class EnergySupplier(
  /**
   * Business ID of the energy supplier. GLN format - 13 digits starting with non-zero.
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
