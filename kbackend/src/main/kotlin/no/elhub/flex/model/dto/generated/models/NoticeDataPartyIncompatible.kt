package no.elhub.flex.model.dto.generated.models

import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Format of the data field in a notice with data.kind = notice.data.party.incompatible
 */
@SerialName("notice.data.party.incompatible")
@Serializable
public data class NoticeDataPartyIncompatible(
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
   * The incompatible parties the entity owns or is a member of.
   */
  @SerialName("party")
  public val party: List<PartyResponse>? = null,
) : NoticeData
