package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - The body that interacts with the Flexibility Information
 * System
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
@Serializable
public data class PartyCreateRequest(
  /**
   * The business identifier of the party. Format depends on `business_id_type`.
   */
  @SerialName("business_id")
  public val businessId: String? = null,
  /**
   * The type of the business identifier.
   */
  @SerialName("business_id_type")
  public val businessIdType: PartyBusinessIdType = PartyBusinessIdType.UUID,
  /**
   * Reference to the entity that is the parent of the party.
   */
  @SerialName("entity_id")
  public val entityId: Int,
  /**
   * Name of the party. Maximum 128 characters.
   */
  @SerialName("name")
  public val name: String,
  /**
   * The role of the party. Currently maps to 1:1 to `type`. E.g. system_operator, service_provider.
   */
  @SerialName("role")
  public val role: PartyRole,
  /**
   * The type of the party, e.g SystemOperator, ServiceProvider
   */
  @SerialName("type")
  public val type: PartyType,
  /**
   * The status of the party.
   */
  @SerialName("status")
  public val status: PartyStatus = PartyStatus.NEW,
)
