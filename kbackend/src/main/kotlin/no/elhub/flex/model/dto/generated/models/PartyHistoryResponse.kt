package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Party - history
 */
@Serializable
public data class PartyHistoryResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * The business identifier of the party. Format depends on `business_id_type`.
   */
  @SerialName("business_id")
  public val businessId: String,
  /**
   * The type of the business identifier.
   */
  @SerialName("business_id_type")
  public val businessIdType: PartyBusinessIdType,
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
  public val status: PartyStatus,
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
  /**
   * Reference to the resource that was updated.
   */
  @SerialName("party_id")
  public val partyId: Int,
  /**
   * The identity that updated the resource when it was replaced.
   */
  @SerialName("replaced_by")
  public val replacedBy: Int? = null,
  /**
   * When the resource was replaced in the system.
   */
  @SerialName("replaced_at")
  public val replacedAt: Instant? = null,
)
