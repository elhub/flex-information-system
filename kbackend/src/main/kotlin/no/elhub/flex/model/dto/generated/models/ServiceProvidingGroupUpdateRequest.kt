package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Group of controllable units
 */
@Serializable
public data class ServiceProvidingGroupUpdateRequest(
  /**
   * Free text name of the service providing group.
   */
  @SerialName("name")
  public val name: String? = null,
  /**
   * The bidding zone that restricts which CUs that can be added to the group. Also known as
   * scheduling area or price area for TSO.
   */
  @SerialName("bidding_zone")
  public val biddingZone: ServiceProvidingGroupBiddingZone? = null,
  /**
   * The status of the group.
   */
  @SerialName("status")
  public val status: ServiceProvidingGroupStatus = ServiceProvidingGroupStatus.NEW,
)
