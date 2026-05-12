package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - The body that interacts with the Flexibility Information
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
public data class PartyUpdateRequest(
  /**
   * Name of the party. Maximum 128 characters.
   */
  @SerialName("name")
  public val name: String? = null,
  /**
   * The status of the party.
   */
  @SerialName("status")
  public val status: PartyStatus = PartyStatus.NEW,
)
