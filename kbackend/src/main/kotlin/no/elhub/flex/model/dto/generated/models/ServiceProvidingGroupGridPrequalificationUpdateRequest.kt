package no.elhub.flex.model.dto.generated.models

import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Grid prequalification for service providing group
 */
@Serializable
public data class ServiceProvidingGroupGridPrequalificationUpdateRequest(
  /**
   * The status of the grid prequalification for this service providing group.
   */
  @SerialName("status")
  public val status: ServiceProvidingGroupGridPrequalificationStatus =
      ServiceProvidingGroupGridPrequalificationStatus.REQUESTED,
  /**
   * When the current grid prequalification was last approved.
   */
  @SerialName("prequalified_at")
  public val prequalifiedAt: Instant? = null,
)
