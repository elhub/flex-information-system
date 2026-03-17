package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A controllable unit returned in the lookup response.
 */
@Serializable
public data class ControllableUnit(
  /**
   * Surrogate key of the controllable unit.
   */
  @SerialName("id")
  public val id: Int,
  /**
   * UUID v4 business ID of the controllable unit.
   */
  @SerialName("business_id")
  public val businessId: String,
  /**
   * Human-readable name of the controllable unit.
   */
  @SerialName("name")
  public val name: String,
  /**
   * Technical resources belonging to this controllable unit.
   */
  @SerialName("technical_resources")
  public val technicalResources: List<TechnicalResource>,
)
