package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Int
import kotlin.String
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Service Providing Group Product Application - history
 */
@Serializable
public data class ServiceProvidingGroupProductApplicationHistoryResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Reference to the service providing group.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Int,
  /**
   * Reference to the procuring system operator.
   */
  @SerialName("procuring_system_operator_id")
  public val procuringSystemOperatorId: Int,
  /**
   * References to the product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Int>,
  /**
   * The status of the application.
   */
  @SerialName("status")
  public val status: ServiceProvidingGroupProductApplicationStatus,
  /**
   * The maximum active power applied for. Stored in kilowatts.
   */
  @Contextual
  @SerialName("maximum_active_power")
  public val maximumActivePower: BigDecimal,
  /**
   * Free text field for extra information about the application if needed (bidding periods,
   * unavailabilities, etc).
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
   * When the resource was recorded (created or updated) in the system.
   */
  @SerialName("recorded_at")
  public val recordedAt: Instant? = null,
  /**
   * The identity that recorded the resource.
   */
  @SerialName("recorded_by")
  public val recordedBy: Int? = null,
  /**
   * Reference to the resource that was updated.
   */
  @SerialName("service_providing_group_product_application_id")
  public val serviceProvidingGroupProductApplicationId: Int,
  /**
   * The identity that updated the resource when it was replaced.
   */
  @SerialName("replaced_by")
  public val replacedBy: Int? = null,
  /**
   * When the resource was replaced in the system.
   */
  @SerialName("replaced_at")
  public val replacedAt: Instant? = null,
)
