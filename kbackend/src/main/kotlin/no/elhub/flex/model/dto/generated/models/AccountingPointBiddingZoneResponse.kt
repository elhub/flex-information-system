package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Relation telling which bidding zone an accounting point belongs to.
 */
@Serializable
public data class AccountingPointBiddingZoneResponse(
  /**
   * The ID of the accounting point.
   */
  @SerialName("accounting_point_id")
  public val accountingPointId: Long? = null,
  /**
   * The bidding zone of the accounting point.
   */
  @SerialName("bidding_zone")
  public val biddingZone: AccountingPointBiddingZoneBiddingZone,
  /**
   * The date from which the accounting point belongs to the bidding zone. Midnight aligned on
   * Norwegian timezone.
   */
  @SerialName("valid_from")
  public val validFrom: Instant? = null,
  /**
   * The date until which the accounting point belongs to the bidding zone. Midnight aligned on
   * Norwegian timezone.
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
)
