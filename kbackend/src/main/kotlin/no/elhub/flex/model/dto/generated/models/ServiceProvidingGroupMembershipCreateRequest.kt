package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Membership relation of controllable unit in service
 * providing group
 */
@Serializable
public data class ServiceProvidingGroupMembershipCreateRequest(
  /**
   * Reference to the controllable unit this relation links to a service providing group.
   */
  @SerialName("controllable_unit_id")
  public val controllableUnitId: Long,
  /**
   * Reference to the service providing group this relation links to a controllable unit.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Long,
  /**
   * The date from which the relation between the controllable unit and the service providing group
   * is valid. Midnight aligned on Norwegian timezone.
   */
  @SerialName("valid_from")
  public val validFrom: Instant,
  /**
   * The date until which the relation between the controllable unit and the service providing group
   * is valid. Midnight aligned on Norwegian timezone.
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
)
