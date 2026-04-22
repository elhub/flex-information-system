package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Accounting point for a controllable unit.
 */
@Serializable
public data class AccountingPointResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * The GSRN metering point id of the accounting point.
   */
  @SerialName("business_id")
  public val businessId: String? = null,
  /**
   * The system operator of the accounting point.
   */
  @SerialName("system_operator_id")
  public val systemOperatorId: Long? = null,
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
   * Response schema - Controllable unit
   */
  @SerialName("controllable_unit")
  public val controllableUnit: ControllableUnitResponse? = null,
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
  @SerialName("system_operator")
  public val systemOperator: PartyResponse? = null,
  /**
   * Response schema - Relation linking a balance responsible party to an accounting point.
   */
  @SerialName("balance_responsible_party")
  public val balanceResponsibleParty: AccountingPointBalanceResponsiblePartyResponse? = null,
  /**
   * Response schema - Relation telling which bidding zone an accounting point belongs to.
   */
  @SerialName("bidding_zone")
  public val biddingZone: AccountingPointBiddingZoneResponse? = null,
  /**
   * Response schema - Relation telling which end user an accounting point belongs to.
   */
  @SerialName("end_user")
  public val endUser: AccountingPointEndUserResponse? = null,
  /**
   * Response schema - Relation linking an energy supplier to an accounting point.
   */
  @SerialName("energy_supplier")
  public val energySupplier: AccountingPointEnergySupplierResponse? = null,
  /**
   * Response schema - Relation telling which metering grid area an accounting point belongs to.
   */
  @SerialName("metering_grid_area")
  public val meteringGridArea: AccountingPointMeteringGridAreaResponse? = null,
)
