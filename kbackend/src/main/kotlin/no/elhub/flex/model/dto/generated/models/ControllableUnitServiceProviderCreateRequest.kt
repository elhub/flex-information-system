package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Relation between controllable unit and service provider
 */
@Serializable
public data class ControllableUnitServiceProviderCreateRequest(
  /**
   * Reference to the controllable unit this relation links to a service provider.
   */
  @SerialName("controllable_unit_id")
  public val controllableUnitId: Long,
  /**
   * Reference to the `party` (service provider) this relation links to a controllable unit.
   */
  @SerialName("service_provider_id")
  public val serviceProviderId: Long,
  /**
   * Technical ID of the end user behind the accounting point.
   */
  @SerialName("end_user_id")
  public val endUserId: Long,
  /**
   * The service providers internal reference to the contract with the end user. Typically an
   * internal identifier to a stored document or consent record.
   */
  @SerialName("contract_reference")
  public val contractReference: String,
  /**
   * The date from which the relation between the controllable unit and the service provider is
   * valid. Midnight aligned on Norwegian timezone.
   */
  @SerialName("valid_from")
  public val validFrom: Instant? = null,
  /**
   * The date until which the relation between the controllable unit and the service provider is
   * valid. Midnight aligned on Norwegian timezone.
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
)
