package no.elhub.flex.model.dto.generated.models

import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Successful response body for controllable unit lookup.
 */
@Serializable
public data class ControllableUnitLookupResponse(
  /**
   * The accounting point behind which the controllable units are located.
   */
  @SerialName("accounting_point")
  public val accountingPoint: ControllableUnitAccountingPoint,
  /**
   * The end user on the accounting point where the controllable units are located.
   */
  @SerialName("end_user")
  public val endUser: AccountingPointEndUser,
  /**
   * Controllable units found for the given end user and accounting point or controllable unit.
   */
  @SerialName("controllable_units")
  public val controllableUnits: List<ControllableUnit>,
)
