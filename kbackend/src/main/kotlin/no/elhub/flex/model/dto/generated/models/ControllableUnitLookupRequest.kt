package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request body for controllable unit lookup.
 */
@Serializable
public data class ControllableUnitLookupRequest(
  /**
   * Norwegian birth number (11 digits) or organisation number (9 digits) of the end user.
   */
  @SerialName("end_user")
  public val endUser: String,
  /**
   * UUID v4 business ID of the controllable unit to look up. Mutually exclusive with
   * `accounting_point`.
   */
  @SerialName("controllable_unit")
  public val controllableUnit: String? = null,
  /**
   * Global Service Relation Number (GSRN) - unique identifier for the accounting point Mutually
   * exclusive with `controllable_unit`.
   */
  @SerialName("accounting_point")
  public val accountingPoint: String? = null,
)
