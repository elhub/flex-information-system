package no.elhub.flex.model.dto.generated.models

import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema for controllable unit lookup operations
 */
@Serializable
public data class ControllableUnitLookupResponse(
  /**
   * The accounting point behind which the controllable units are located.
   */
  @SerialName("accounting_point")
  public val accountingPoint: ControllableUnitLookupResponseAccountingPoint,
  /**
   * The end user on the accounting point where the controllable units are located.
   */
  @SerialName("end_user")
  public val endUser: ControllableUnitLookupResponseEndUser,
  /**
   * The controllable units that were found for the given end user or accounting point.
   */
  @SerialName("controllable_units")
  public val controllableUnits: List<ControllableUnitLookupResponseControllableUnits>,
)
