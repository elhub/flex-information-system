package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
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
   * Response schema - Membership relation of controllable unit in service providing group
   */
  @SerialName("membership")
  public val membership: ServiceProvidingGroupMembershipResponse? = null,
  /**
   * Response schema - Grid prequalification for service providing group
   */
  @SerialName("grid_prequalification")
  public val gridPrequalification: ServiceProvidingGroupGridPrequalificationResponse? = null,
  /**
   * Response schema - The relation allowing an impacted system operator to temporarily suspend a
   * service providing group from delivering services.
   */
  @SerialName("grid_suspension")
  public val gridSuspension: ServiceProvidingGroupGridSuspensionResponse? = null,
  /**
   * Response schema - Relation between a service providing group and a system operator for a
   * product type, for the SPG to deliver a product to the SO later.
   */
  @SerialName("product_application")
  public val productApplication: ServiceProvidingGroupProductApplicationResponse? = null,
  /**
   * Response schema - The relation allowing a procuring system operator to temporarily suspend a
   * service providing group from delivering products of certain types.
   */
  @SerialName("product_suspension")
  public val productSuspension: ServiceProvidingGroupProductSuspensionResponse? = null,
)
