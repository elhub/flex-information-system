package no.elhub.flex.api.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Long
import kotlin.String
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Relation between a service providing group and a system
 * operator for a product type, for the SPG to deliver a product to the SO later.
 */
@Serializable
public data class ServiceProvidingGroupProductApplicationUpdateRequest(
  /**
   * References to the product types. An application is for exactly one product type.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Long>? = null,
  /**
   * The status of the application.
   */
  @SerialName("status")
  public val status: ServiceProvidingGroupProductApplicationStatus =
      ServiceProvidingGroupProductApplicationStatus.REQUESTED,
  /**
   * The maximum active power applied for in regulation direction up. Stored in kilowatts.
   * Deprecated: use `application_details` instead.
   */
  @Contextual
  @SerialName("maximum_active_power_up")
  public val maximumActivePowerUp: BigDecimal? = null,
  /**
   * The maximum active power applied for in regulation direction down. Stored in kilowatts.
   * Deprecated: use `application_details` instead.
   */
  @Contextual
  @SerialName("maximum_active_power_down")
  public val maximumActivePowerDown: BigDecimal? = null,
  /**
   * Free text field for extra information about the application if needed (bidding periods,
   * unavailabilities, etc). Deprecated: use `application_details` instead.
   */
  @SerialName("additional_information")
  public val additionalInformation: String? = null,
  /**
   * When the product application was last prequalified.
   */
  @SerialName("prequalified_at")
  public val prequalifiedAt: Instant? = null,
  /**
   * When the product application was last verified.
   */
  @SerialName("verified_at")
  public val verifiedAt: Instant? = null,
  /**
   * Whether the service providing group can ramp in accordance with the product requirements during
   * both activation and deactivation. Deprecated: use `application_details` instead.
   */
  @SerialName("ramping_capability")
  public val rampingCapability: ServiceProvidingGroupProductApplicationRampingCapability? = null,
  /**
   * Free text description of ramping details. Deprecated: use `application_details` instead.
   */
  @SerialName("ramping_description")
  public val rampingDescription: String? = null,
  /**
   * When the application was last marked complete by the procuring system operator.
   */
  @SerialName("complete_at")
  public val completeAt: Instant? = null,
  /**
   * When the product application was put to requested.
   */
  @SerialName("requested_at")
  public val requestedAt: Instant? = null,
  /**
   * Product-specific application details, written by the service provider. The variant is selected
   * by `kind`, which is the business ID of the product type of the application.
   */
  @SerialName("application_details")
  public val applicationDetails: SpgpaApplicationDetails? = null,
  /**
   * Product-specific assessment details, written by the procuring system operator. The variant is
   * selected by `kind`, which must be the same as the `kind` of the application details.
   */
  @SerialName("assessment_details")
  public val assessmentDetails: SpgpaAssessmentDetails? = null,
)
