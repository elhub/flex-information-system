package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Resource uniquely identifying a user by linking its entity and the potentially
 * assumed party.
 */
@Serializable
public data class IdentityResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Reference to the entity using the identity.
   */
  @SerialName("entity_id")
  public val entityId: Long? = null,
  /**
   * Name of the entity using the identity.
   */
  @SerialName("entity_name")
  public val entityName: String? = null,
  /**
   * Reference to the party assumed by the entity.
   */
  @SerialName("party_id")
  public val partyId: Long? = null,
  /**
   * Name of the party assumed by the entity.
   */
  @SerialName("party_name")
  public val partyName: String? = null,
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
)
