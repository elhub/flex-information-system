package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Long
import kotlin.String
import kotlin.collections.List
import kotlin.time.Instant
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Relation between a service providing group and a system operator for a product
 * type, for the SPG to deliver a product to the SO later.
 */
@Serializable
public data class ServiceProvidingGroupProductApplicationResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Reference to the service providing group.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Long,
  /**
   * Reference to the procuring system operator.
   */
  @SerialName("procuring_system_operator_id")
  public val procuringSystemOperatorId: Long,
  /**
   * References to the product types.
   */
  @SerialName("product_type_ids")
  public val productTypeIds: List<Long>,
  /**
   * The status of the application.
   */
  @SerialName("status")
  public val status: ServiceProvidingGroupProductApplicationStatus,
  /**
   * The maximum active power applied for in the upward direction. Stored in kilowatts.
   */
  @Contextual
  @SerialName("maximum_active_power_up")
  public val maximumActivePowerUp: BigDecimal,
  /**
   * The maximum active power applied for in the downward direction. Stored in kilowatts.
   */
  @Contextual
  @SerialName("maximum_active_power_down")
  public val maximumActivePowerDown: BigDecimal,
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
  public val recordedBy: Long? = null,
)
