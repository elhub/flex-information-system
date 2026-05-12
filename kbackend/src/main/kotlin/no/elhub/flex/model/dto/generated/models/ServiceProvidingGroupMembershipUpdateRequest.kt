package no.elhub.flex.model.dto.generated.models

import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Membership relation of controllable unit in service
 * providing group
 */
@Serializable
public data class ServiceProvidingGroupMembershipUpdateRequest(
  /**
   * The date from which the relation between the controllable unit and the service providing group
   * is valid. Midnight aligned on Norwegian timezone.
   */
  @SerialName("valid_from")
  public val validFrom: Instant? = null,
  /**
   * The date until which the relation between the controllable unit and the service providing group
   * is valid. Midnight aligned on Norwegian timezone.
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
)
