package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Relation between controllable unit and service provider
 */
@Serializable
public data class ControllableUnitServiceProviderUpdateRequest(
  /**
   * The service providers internal reference to the contract with the end user. Typically an
   * internal identifier to a stored document or consent record.
   */
  @SerialName("contract_reference")
  public val contractReference: String? = null,
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
