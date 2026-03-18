package no.elhub.flex.model.dto.generated.models

import kotlin.Int
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
  public val accountingPointId: Int? = null,
  /**
   * The energy supplier of the accounting point.
   */
  @SerialName("energy_supplier_id")
  public val energySupplierId: Int? = null,
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
)
