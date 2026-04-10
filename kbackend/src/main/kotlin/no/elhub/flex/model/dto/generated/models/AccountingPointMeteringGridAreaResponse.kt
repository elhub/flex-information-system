package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Relation telling which metering grid area an accounting point belongs to.
 */
@Serializable
public data class AccountingPointMeteringGridAreaResponse(
  /**
   * The ID of the accounting point.
   */
  @SerialName("accounting_point_id")
  public val accountingPointId: Long? = null,
  /**
   * The metering grid area of the accounting point.
   */
  @SerialName("metering_grid_area_id")
  public val meteringGridAreaId: Long? = null,
  /**
   * The date from which the accounting point belongs to the metering grid area. Midnight aligned on
   * Norwegian timezone.
   */
  @SerialName("valid_from")
  public val validFrom: Instant? = null,
  /**
   * The date until which the accounting point belongs to the metering grid area. Midnight aligned
   * on Norwegian timezone.
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
)
