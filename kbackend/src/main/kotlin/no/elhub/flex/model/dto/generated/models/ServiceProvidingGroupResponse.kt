package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Group of controllable units
 */
@Serializable
public data class ServiceProvidingGroupResponse(
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
   * Free text field for extra information about the service providing group if needed.
   */
  @SerialName("additional_information")
  public val additionalInformation: String? = null,
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
   * Response schema - Per-substation breakdown of controllable units and their technical details
   * for a service providing group.
   */
  @SerialName("power_per_substation")
  public val powerPerSubstation: ServiceProvidingGroupPowerPerSubstationResponse? = null,
  /**
   * Response schema - Aggregated summary of controllable units and technical resources belonging to
   * a service providing group.
   */
  @SerialName("summary")
  public val summary: ServiceProvidingGroupSummaryResponse? = null,
  /**
   * Response schema - The body that interacts with the Flexibility Information System
   *
   * A party is the thing that is authorized to access or modify data in the Flexiblity Information
   * System.
   *
   * Example party types:
   *
   * * Service Provider
   * * System Operator
   * * End User
   */
  @SerialName("service_provider")
  public val serviceProvider: PartyResponse? = null,
  /**
   * Embedded service_providing_group_membership
   */
  @SerialName("membership")
  public val membership: List<ServiceProvidingGroupMembershipResponse>? = null,
  /**
   * Embedded service_providing_group_grid_prequalification
   */
  @SerialName("grid_prequalification")
  public val gridPrequalification: List<ServiceProvidingGroupGridPrequalificationResponse>? = null,
  /**
   * Embedded service_providing_group_grid_suspension
   */
  @SerialName("grid_suspension")
  public val gridSuspension: List<ServiceProvidingGroupGridSuspensionResponse>? = null,
  /**
   * Embedded service_providing_group_product_application
   */
  @SerialName("product_application")
  public val productApplication: List<ServiceProvidingGroupProductApplicationResponse>? = null,
  /**
   * Embedded service_providing_group_product_suspension
   */
  @SerialName("product_suspension")
  public val productSuspension: List<ServiceProvidingGroupProductSuspensionResponse>? = null,
)
