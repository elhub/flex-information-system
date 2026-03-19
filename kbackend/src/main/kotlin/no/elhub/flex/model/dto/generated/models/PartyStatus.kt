package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The status of the party.
 */
public enum class PartyStatus(
  public val `value`: String,
) {
  @SerialName("new")
  NEW("new"),
  @SerialName("active")
  ACTIVE("active"),
  @SerialName("inactive")
  INACTIVE("inactive"),
  @SerialName("suspended")
  SUSPENDED("suspended"),
  @SerialName("terminated")
  TERMINATED("terminated"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, PartyStatus> = entries.associateBy(PartyStatus::value)

    public fun fromValue(`value`: String): PartyStatus? = mapping[value]
  }
}
