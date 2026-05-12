package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The direction of the effect on the balance that the BRP takes responsibility for.
 */
public enum class AccountingPointBalanceResponsiblePartyEnergyDirection(
  public val `value`: String,
) {
  @SerialName("consumption")
  CONSUMPTION("consumption"),
  @SerialName("production")
  PRODUCTION("production"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, AccountingPointBalanceResponsiblePartyEnergyDirection> =
        entries.associateBy(AccountingPointBalanceResponsiblePartyEnergyDirection::value)

    public fun fromValue(`value`: String): AccountingPointBalanceResponsiblePartyEnergyDirection? =
        mapping[value]
  }
}
