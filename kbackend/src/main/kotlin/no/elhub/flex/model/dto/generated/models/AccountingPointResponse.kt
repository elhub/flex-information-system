package no.elhub.flex.model.dto.generated.models

import kotlin.Any
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
   * Embedded controllable_unit
   */
  @SerialName("controllable_unit")
  public val controllableUnit: Any? = null,
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
  public val balanceResponsibleParty: Any? = null,
  /**
   * Embedded accounting_point_bidding_zone
   */
  @SerialName("bidding_zone")
  public val biddingZone: Any? = null,
  /**
   * Embedded accounting_point_end_user
   */
  @SerialName("end_user")
  public val endUser: Any? = null,
  /**
   * Embedded accounting_point_energy_supplier
   */
  @SerialName("energy_supplier")
  public val energySupplier: Any? = null,
  /**
   * Embedded accounting_point_metering_grid_area
   */
  @SerialName("metering_grid_area")
  public val meteringGridArea: Any? = null,
)
