package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for controllable unit lookup operations
 */
@Serializable
public data class ControllableUnitLookupRequest(
  /**
   * Birth number or organisation number of the end user.
   */
  @SerialName("end_user")
  public val endUser: String,
  /**
   * The business ID of the controllable unit to lookup.
   */
  @SerialName("controllable_unit")
  public val controllableUnit: String? = null,
  /**
   * The accounting point ID of the controllable unit(s) to lookup. `GSRN` metering point id.
   */
  @SerialName("accounting_point")
  public val accountingPoint: String? = null,
)
