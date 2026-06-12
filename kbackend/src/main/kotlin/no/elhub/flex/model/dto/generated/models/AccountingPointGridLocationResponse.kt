package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Long
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - The electrical (topological) location of an accounting point in the common grid
 * model (Nemo).
 */
@Serializable
public data class AccountingPointGridLocationResponse(
  /**
   * Unique surrogate key.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * The accounting point this grid location belongs to.
   */
  @SerialName("accounting_point_id")
  public val accountingPointId: Long,
  /**
   * The type of object in the common grid model that the accounting point is at.
   */
  @SerialName("object_type")
  public val objectType: AccountingPointGridLocationObjectType,
  /**
   * Business identifier (mRID) referencing the object in the common grid model.
   */
  @SerialName("business_id")
  public val businessId: String,
  /**
   * Name of the grid model object at the location.
   */
  @SerialName("name")
  public val name: String,
  /**
   * Nominal voltage level at the grid location, in kilovolt (kV).
   */
  @Contextual
  @SerialName("nominal_voltage")
  public val nominalVoltage: BigDecimal,
  /**
   * Free text field for extra information about the grid location if needed.
   */
  @SerialName("additional_information")
  public val additionalInformation: String? = null,
  /**
   * How the grid location was determined. When a system operator creates or updates a grid
   * location, this field is set automatically: `cso` if the SO is the connecting system operator, `so`
   * otherwise.
   */
  @SerialName("source")
  public val source: AccountingPointGridLocationSource? = null,
  /**
   * The quality of the grid location registration.
   */
  @SerialName("quality")
  public val quality: AccountingPointGridLocationQuality,
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
   * Response schema - Accounting point for a controllable unit.
   */
  @SerialName("accounting_point")
  public val accountingPoint: AccountingPointResponse? = null,
)
