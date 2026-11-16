package no.elhub.flex.api.model.dto.generated.models

import java.math.BigDecimal
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Assessment details of the procuring system operator for the product type with business ID
 * automatic_frequency_containment (FCR-N). Answers spgpa_application_details_fcr_n. The approved
 * maximum active power in directions up and down must be equal.
 */
@SerialName("automatic_frequency_containment")
@Serializable
public data class SpgpaAssessmentDetailsFcrN(
  /**
   * Maximum active power in kilowatts.
   */
  @Contextual
  @SerialName("approved_maximum_active_power_up")
  public val approvedMaximumActivePowerUp: BigDecimal,
  /**
   * Maximum active power in kilowatts.
   */
  @Contextual
  @SerialName("approved_maximum_active_power_down")
  public val approvedMaximumActivePowerDown: BigDecimal,
) : SpgpaAssessmentDetails
