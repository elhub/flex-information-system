package no.elhub.flex.api.model.dto.generated.models

import java.math.BigDecimal
import kotlin.String
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Product-specific application details for Manual Frequency Restoration (mFRR), written by the
 * service provider. Has no assessment details.
 */
@SerialName("manual_frequency_restoration")
@Serializable
public data class SpgpaApplicationDetailsMfrr(
  /**
   * Maximum active power, in kilowatts.
   */
  @Contextual
  @SerialName("maximum_active_power_up")
  public val maximumActivePowerUp: BigDecimal,
  /**
   * Maximum active power, in kilowatts.
   */
  @Contextual
  @SerialName("maximum_active_power_down")
  public val maximumActivePowerDown: BigDecimal,
  /**
   * Whether the service providing group can ramp in accordance with the product requirements during
   * both activation and deactivation.
   */
  @SerialName("ramping_capability")
  public val rampingCapability: SpgpaRampingCapability,
  /**
   * Free text description of ramping details.
   */
  @SerialName("ramping_description")
  public val rampingDescription: String,
  /**
   * Free text field for extra information about the application if needed (bidding periods,
   * unavailabilities, etc).
   */
  @SerialName("additional_information")
  public val additionalInformation: String? = null,
) : SpgpaApplicationDetails
