package no.elhub.flex.integration.accountingpointadapter.generated.models

import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class EndUser(
  /**
   * Business ID of the end user. Norwegian organization number or fødselsnummer, depending on
   * `business_id_type``.
   */
  @SerialName("business_id")
  public val businessId: String,
  /**
   * Type of the end user entity, either a person or an organisation.
   */
  @SerialName("entity_type")
  public val entityType: EndUserEntityType? = null,
  /**
   * Start of the validity period
   */
  @SerialName("valid_from")
  public val validFrom: Instant,
  /**
   * End of the validity period
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
)
