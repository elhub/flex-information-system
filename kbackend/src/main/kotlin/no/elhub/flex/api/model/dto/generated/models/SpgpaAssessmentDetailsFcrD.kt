package no.elhub.flex.api.model.dto.generated.models

import java.math.BigDecimal
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Product-specific assessment details for FCR-D, written by the procuring system operator. Answers
 * `spgpa_application_details_fcr_d`.
 */
@SerialName("automatic_frequency_containment_disturbance")
@Serializable
public data class SpgpaAssessmentDetailsFcrD(
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
