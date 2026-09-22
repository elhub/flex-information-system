package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.String
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - The electrical (topological) location of an accounting
 * point in the common grid model (Nemo).
 */
@Serializable
public data class AccountingPointGridLocationUpdateRequest(
  /**
   * The type of object in the common grid model that the accounting point is at.
   */
  @SerialName("object_type")
  public val objectType: AccountingPointGridLocationObjectType? = null,
  /**
   * Business identifier (mRID) referencing the object in the common grid model (NEMO).
   */
  @SerialName("business_id")
  public val businessId: String? = null,
  /**
   * Name of the grid model object at the location.
   */
  @SerialName("name")
  public val name: String? = null,
  /**
   * Nominal voltage level at the grid location, in kilovolt (kV).
   */
  @Contextual
  @SerialName("nominal_voltage")
  public val nominalVoltage: BigDecimal? = null,
  /**
   * Free text field for extra information about the grid location if needed.
   */
  @SerialName("additional_information")
  public val additionalInformation: String? = null,
  /**
   * Indicates how the grid location was determined. Guessed means that Flexibility Information
   * System has estimated the location, while confirmed means that someone has verified it.
   */
  @SerialName("quality")
  public val quality: AccountingPointGridLocationQuality? = null,
)
