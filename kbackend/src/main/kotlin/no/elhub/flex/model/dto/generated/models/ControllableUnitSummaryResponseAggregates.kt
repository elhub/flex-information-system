package no.elhub.flex.model.dto.generated.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Aggregated statistics on technical resources belonging to the controllable unit, including counts
 * and maximum active power breakdowns (sum, average, min, max) by category and technology.
 */
@Serializable
public data class ControllableUnitSummaryResponseAggregates(
  @SerialName("technical_resource")
  public val technicalResource: ControllableUnitSummaryResponseTechnicalResource? = null,
)
