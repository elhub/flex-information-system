package no.elhub.flex.integration.accountingpointadapter.generated.models

import java.util.LinkedHashSet
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class EnergyDirection(
  /**
   * Energy direction(s) of the accounting point.
   */
  @SerialName("direction")
  public val direction: LinkedHashSet<EnergyDirectionDirection>,
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
