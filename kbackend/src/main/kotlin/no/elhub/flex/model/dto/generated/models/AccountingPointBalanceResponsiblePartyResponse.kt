package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Relation linking a balance responsible party to an accounting point.
 */
@Serializable
public data class AccountingPointBalanceResponsiblePartyResponse(
  /**
   * The ID of the accounting point.
   */
  @SerialName("accounting_point_id")
  public val accountingPointId: Int? = null,
  /**
   * The balance responsible party of the accounting point.
   */
  @SerialName("balance_responsible_party_id")
  public val balanceResponsiblePartyId: Int? = null,
  /**
   * The direction of the effect on the balance that the BRP takes responsibility for.
   */
  @SerialName("energy_direction")
  public val energyDirection: AccountingPointBalanceResponsiblePartyEnergyDirection? = null,
  /**
   * The date from which the relation between the accounting point and the balance responsible party
   * is valid. Midnight aligned on Norwegian timezone.
   */
  @SerialName("valid_from")
  public val validFrom: Instant? = null,
  /**
   * The date until which the relation between the accounting point and the balance responsible
   * party is valid. Midnight aligned on Norwegian timezone.
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
)
