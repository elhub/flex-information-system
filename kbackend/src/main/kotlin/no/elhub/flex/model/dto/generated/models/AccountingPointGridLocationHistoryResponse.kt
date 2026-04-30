package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Long
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Accounting Point Grid Location - history
 */
@Serializable
public data class AccountingPointGridLocationHistoryResponse(
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
  public val businessId: String? = null,
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
   * How the grid location was determined.
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
   * Reference to the resource that was updated.
   */
  @SerialName("accounting_point_grid_location_id")
  public val accountingPointGridLocationId: Long,
  /**
   * The identity that updated the resource when it was replaced.
   */
  @SerialName("replaced_by")
  public val replacedBy: Long? = null,
  /**
   * When the resource was replaced in the system.
   */
  @SerialName("replaced_at")
  public val replacedAt: Instant? = null,
)
