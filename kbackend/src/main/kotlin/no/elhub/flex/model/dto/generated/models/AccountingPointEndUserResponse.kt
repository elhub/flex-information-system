package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Relation telling which end user an accounting point belongs to.
 */
@Serializable
public data class AccountingPointEndUserResponse(
  /**
   * The ID of the accounting point.
   */
  @SerialName("accounting_point_id")
  public val accountingPointId: Long? = null,
  /**
   * The end user on the accounting point.
   */
  @SerialName("end_user_id")
  public val endUserId: Long? = null,
  /**
   * The date from which the accounting point belongs to the end user. Midnight aligned on Norwegian
   * timezone.
   */
  @SerialName("valid_from")
  public val validFrom: Instant? = null,
  /**
   * The date until which the accounting point belongs to the end user. Midnight aligned on
   * Norwegian timezone.
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
)
