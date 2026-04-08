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
 * Request schema for update operations - Relation between a service providing group and a system
 * operator for a product type, for the SPG to deliver a product to the SO later.
 */
@Serializable
public data class ServiceProvidingGroupProductApplicationUpdateRequest(
  /**
   * References to the product types.
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
   * The maximum active power applied for. Stored in kilowatts.
   */
  @Contextual
  @SerialName("maximum_active_power")
  public val maximumActivePower: BigDecimal? = null,
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
)
