package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The controllable units that were found for the given end user or accounting point.
 */
@Serializable
public data class ControllableUnitLookupResponseControllableUnits(
  /**
   * The surrogate key of the controllable unit.
   */
  @SerialName("id")
  public val id: Long,
  /**
   * The business ID of the controllable unit.
   */
  @SerialName("business_id")
  public val businessId: String,
  /**
   * The name of the controllable unit.
   */
  @SerialName("name")
  public val name: String,
  /**
   * The technical resources belonging to the controllable unit.
   */
  @SerialName("technical_resources")
  public val technicalResources: List<ControllableUnitLookupResponseTechnicalResources>,
)
