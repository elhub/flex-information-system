package no.elhub.flex.api.model.dto.generated.models

import java.math.BigDecimal
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Product-specific assessment details for FCR-N, written by the procuring system operator. Answers
 * `spgpa_application_details_fcr_n`. FCR-N is symmetric, so the approved maximum active power up and
 * down must be equal.
 */
@SerialName("automatic_frequency_containment")
@Serializable
public data class SpgpaAssessmentDetailsFcrN(
  /**
   * Maximum active power, in kilowatts.
   */
  @Contextual
  @SerialName("approved_maximum_active_power_up")
  public val approvedMaximumActivePowerUp: BigDecimal,
  /**
   * Maximum active power, in kilowatts.
   */
  @Contextual
  @SerialName("approved_maximum_active_power_down")
  public val approvedMaximumActivePowerDown: BigDecimal,
) : SpgpaAssessmentDetails
