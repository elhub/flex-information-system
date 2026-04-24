package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Aggregated summary of technical resources belonging to a controllable unit.
 */
@Serializable
public data class ControllableUnitSummaryResponse(
  /**
   * Unique surrogate key (controllable unit ID).
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * The ID of the controllable unit this resource is a summary of.
   */
  @SerialName("controllable_unit_id")
  public val controllableUnitId: Long? = null,
  /**
   * Aggregated statistics on technical resources belonging to the controllable unit, including
   * counts and maximum active power breakdowns (sum, average, min, max) by category and technology.
   */
  @SerialName("technical_resource")
  public val technicalResource: ControllableUnitSummaryResponseTechnicalResource? = null,
  /**
   * Response schema - Controllable unit
   */
  @SerialName("controllable_unit")
  public val controllableUnit: ControllableUnitResponse? = null,
)
