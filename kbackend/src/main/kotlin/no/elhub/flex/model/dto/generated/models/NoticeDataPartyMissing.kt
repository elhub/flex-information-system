package no.elhub.flex.model.dto.generated.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Format of the data field in a notice of type no.elhub.flex.party.missing
 */
@SerialName("notice_data_party_missing")
@Serializable
public data class NoticeDataPartyMissing(
  /**
   * Response schema - Entity - Natural or legal person
   *
   * An entity is a natural or legal person that can be a party in the Flexibility Information
   * System.
   *
   * Example entity types:
   *
   * * Person
   * * Organisation
   */
  @SerialName("entity")
  public val entity: EntityResponse? = null,
  /**
   * Response schema - The body that interacts with the Flexibility Information System
   *
   * A party is the thing that is authorized to access or modify data in the Flexiblity Information
   * System.
   *
   * Example party types:
   *
   * * Service Provider
   * * System Operator
   * * End User
   */
  @SerialName("party")
  public val party: PartyResponse? = null,
) : NoticeData
