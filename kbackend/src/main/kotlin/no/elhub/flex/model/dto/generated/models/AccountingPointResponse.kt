package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.collections.List
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
   * Geographic location of the accounting point (WGS84), as a PostGIS geometry point. Serialized as
   * a WKB hex string by PostgREST. Can be written as an EWKT string (e.g. "SRID=4326;POINT(10.7522
   * 59.9139)").
   */
  @SerialName("location")
  public val location: String? = null,
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
   * Embedded controllable_unit
   */
  @SerialName("controllable_unit")
  public val controllableUnit: List<ControllableUnitResponse>? = null,
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
   * Embedded accounting_point_balance_responsible_party
   */
  @SerialName("balance_responsible_party")
  public val balanceResponsibleParty: List<AccountingPointBalanceResponsiblePartyResponse>? = null,
  /**
   * Embedded accounting_point_bidding_zone
   */
  @SerialName("bidding_zone")
  public val biddingZone: List<AccountingPointBiddingZoneResponse>? = null,
  /**
   * Embedded accounting_point_end_user
   */
  @SerialName("end_user")
  public val endUser: List<AccountingPointEndUserResponse>? = null,
  /**
   * Embedded accounting_point_energy_supplier
   */
  @SerialName("energy_supplier")
  public val energySupplier: List<AccountingPointEnergySupplierResponse>? = null,
  /**
   * Embedded accounting_point_metering_grid_area
   */
  @SerialName("metering_grid_area")
  public val meteringGridArea: List<AccountingPointMeteringGridAreaResponse>? = null,
  /**
   * Response schema - The electrical (topological) location of an accounting point in the common
   * grid model (Nemo).
   */
  @SerialName("grid_location")
  public val gridLocation: AccountingPointGridLocationResponse? = null,
)
