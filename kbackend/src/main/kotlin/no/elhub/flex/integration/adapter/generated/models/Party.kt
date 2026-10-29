package no.elhub.flex.integration.adapter.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class Party(
  /**
   * Business ID of the party. GLN format - 13 digits starting with non-zero.
   */
  @SerialName("gln")
  public val gln: String,
  /**
   * Norwegian organisation number of the organisation acting as the party.
   */
  @SerialName("org")
  public val org: String,
  /**
   * Name of the party
   */
  @SerialName("name")
  public val name: String,
  /**
   * Type of the party
   */
  @SerialName("type")
  public val type: PartyType,
)
