package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Accounting point for a controllable unit.
 */
@Serializable
public data class AccountingPointResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * The GSRN metering point id of the accounting point.
   */
  @SerialName("business_id")
  public val businessId: String? = null,
  /**
   * The system operator of the accounting point.
   */
  @SerialName("system_operator_id")
  public val systemOperatorId: Int? = null,
  /**
   * When the resource was recorded (created or updated) in the system.
   */
  @SerialName("recorded_at")
  public val recordedAt: Instant? = null,
  /**
   * The identity that recorded the resource.
   */
  @SerialName("recorded_by")
  public val recordedBy: Int? = null,
)
