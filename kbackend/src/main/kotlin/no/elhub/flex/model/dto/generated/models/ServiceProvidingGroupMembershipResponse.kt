package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Membership relation of controllable unit in service providing group
 */
@Serializable
public data class ServiceProvidingGroupMembershipResponse(
  /**
   * Unique surrogate key.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Reference to the controllable unit this relation links to a service providing group.
   */
  @SerialName("controllable_unit_id")
  public val controllableUnitId: Int,
  /**
   * Reference to the service providing group this relation links to a controllable unit.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Int,
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
