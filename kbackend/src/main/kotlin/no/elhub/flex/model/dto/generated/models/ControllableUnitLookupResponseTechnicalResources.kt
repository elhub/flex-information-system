package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The technical resources belonging to the controllable unit.
 */
@Serializable
public data class ControllableUnitLookupResponseTechnicalResources(
  /**
   * The surrogate key of the technical resource.
   */
  @SerialName("id")
  public val id: Long,
  /**
   * The name of the technical resource.
   */
  @SerialName("name")
  public val name: String,
)
