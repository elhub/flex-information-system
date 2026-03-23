package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Relation between controllable unit and service provider
 */
@Serializable
public data class ControllableUnitServiceProviderResponse(
  /**
   * Unique surrogate key.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * Reference to the controllable unit this relation links to a service provider.
   */
  @SerialName("controllable_unit_id")
  public val controllableUnitId: Int,
  /**
   * Reference to the `party` (service provider) this relation links to a controllable unit.
   */
  @SerialName("service_provider_id")
  public val serviceProviderId: Int,
  /**
   * Technical ID of the end user behind the accounting point.
   */
  @SerialName("end_user_id")
  public val endUserId: Int,
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
)
