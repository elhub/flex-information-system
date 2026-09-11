package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Relation linking an energy supplier to an accounting point.
 */
@Serializable
public data class AccountingPointEnergySupplierResponse(
  /**
   * The ID of the accounting point.
   */
  @SerialName("accounting_point_id")
  public val accountingPointId: Long? = null,
  /**
   * The energy supplier of the accounting point.
   */
  @SerialName("energy_supplier_id")
  public val energySupplierId: Long? = null,
  /**
   * The date from which the relation between the accounting point and the energy supplier is valid.
   * Midnight aligned on Norwegian timezone.
   */
  @SerialName("valid_from")
  public val validFrom: Instant? = null,
  /**
   * The date until which the relation between the accounting point and the energy supplier is
   * valid. Midnight aligned on Norwegian timezone.
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
  /**
   * Response schema - Accounting point for a controllable unit.
   */
  @SerialName("accounting_point")
  public val accountingPoint: AccountingPointResponse? = null,
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
  @SerialName("energy_supplier")
  public val energySupplier: PartyResponse? = null,
)
