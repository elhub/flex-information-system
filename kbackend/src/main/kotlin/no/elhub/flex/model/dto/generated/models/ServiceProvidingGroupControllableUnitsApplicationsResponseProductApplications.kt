package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Details about the product applications for this controllable unit
 */
@Serializable
public data class ServiceProvidingGroupControllableUnitsApplicationsResponseProductApplications(
  /**
   * The surrogate key of the product application
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * When the prequalification was completed, null if not
   */
  @SerialName("prequalified_at")
  public val prequalifiedAt: Instant? = null,
)
