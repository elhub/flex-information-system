package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Service providing group - history
 */
@Serializable
public data class ServiceProvidingGroupHistoryResponse(
  /**
   * Unique surrogate key.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Free text name of the service providing group.
   */
  @SerialName("name")
  public val name: String,
  /**
   * Reference to the `party` (service provider) managing the group.
   */
  @SerialName("service_provider_id")
  public val serviceProviderId: Long,
  /**
   * The bidding zone that restricts which CUs that can be added to the group. Also known as
   * scheduling area or price area for TSO.
   */
  @SerialName("bidding_zone")
  public val biddingZone: ServiceProvidingGroupBiddingZone,
  /**
   * The status of the group.
   */
  @SerialName("status")
  public val status: ServiceProvidingGroupStatus,
  /**
   * When the resource was recorded (created or updated) in the system.
   */
  @SerialName("recorded_at")
  public val recordedAt: Instant? = null,
  /**
   * The identity that recorded the resource.
   */
  @SerialName("recorded_by")
  public val recordedBy: Long? = null,
  /**
   * Reference to the resource that was updated.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Long,
  /**
   * The identity that updated the resource when it was replaced.
   */
  @SerialName("replaced_by")
  public val replacedBy: Long? = null,
  /**
   * When the resource was replaced in the system.
   */
  @SerialName("replaced_at")
  public val replacedAt: Instant? = null,
)
