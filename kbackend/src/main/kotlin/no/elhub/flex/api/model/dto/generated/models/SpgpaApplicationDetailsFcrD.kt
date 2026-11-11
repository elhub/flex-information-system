package no.elhub.flex.api.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Boolean
import kotlin.String
import kotlinx.datetime.LocalDate
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Product-specific application details for Frequency Containment Reserve Disturbance (FCR-D),
 * written by the service provider. Answered by `spgpa_assessment_details_fcr_d`.
 */
@SerialName("automatic_frequency_containment_disturbance")
@Serializable
public data class SpgpaApplicationDetailsFcrD(
  /**
   * Contact information for the service provider.
   */
  @SerialName("service_provider_contact_information")
  public val serviceProviderContactInformation: String,
  /**
   * Contact information for the technical contact person.
   */
  @SerialName("technical_contact_information")
  public val technicalContactInformation: String,
  /**
   * Whether the service providing group has a limited energy reservoir.
   */
  @SerialName("limited_energy_reservoir")
  public val limitedEnergyReservoir: Boolean,
  /**
   * Whether the service providing group has variable production or consumption.
   */
  @SerialName("variable_production_consumption")
  public val variableProductionConsumption: Boolean,
  /**
   * The planned date of the prequalification test.
   */
  @SerialName("planned_prequalification_test_date")
  public val plannedPrequalificationTestDate: LocalDate,
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
) : SpgpaApplicationDetails
