package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Long
import kotlin.String
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - The electrical (topological) location of an accounting
 * point in the common grid model (Nemo).
 */
@Serializable
public data class AccountingPointGridLocationCreateRequest(
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
  public val source: AccountingPointGridLocationSource,
  /**
   * The quality of the grid location registration.
   */
  @SerialName("quality")
  public val quality: AccountingPointGridLocationQuality,
)
