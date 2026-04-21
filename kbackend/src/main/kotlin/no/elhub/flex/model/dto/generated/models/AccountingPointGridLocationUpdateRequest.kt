package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.String
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for updating the grid location of an accounting point. The accounting point is
 * identified by the URL path parameter. All fields are optional except quality. The source is derived
 * from the requester's identity in the backend.
 */
@Serializable
public data class AccountingPointGridLocationUpdateRequest(
  /**
   * The type of object in the common grid model that the accounting point is at.
   */
  @SerialName("object_type")
  public val objectType: AccountingPointGridLocationUpdateRequestObjectType? = null,
  /**
   * Business identifier (mRID) referencing the object in the common grid model.
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
   * The quality of the grid location registration.
   */
  @SerialName("quality")
  public val quality: AccountingPointGridLocationUpdateRequestQuality,
)
