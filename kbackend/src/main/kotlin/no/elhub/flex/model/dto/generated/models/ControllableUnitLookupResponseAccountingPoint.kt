package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The accounting point behind which the controllable units are located.
 */
@Serializable
public data class ControllableUnitLookupResponseAccountingPoint(
  /**
   * The surrogate key of the accounting point.
   */
  @SerialName("id")
  public val id: Long,
  /**
   * The GSRN metering point ID of the accounting point.
   */
  @SerialName("business_id")
  public val businessId: String,
)
