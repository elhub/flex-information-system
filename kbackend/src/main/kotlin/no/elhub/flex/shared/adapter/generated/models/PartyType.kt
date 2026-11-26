package no.elhub.flex.shared.adapter.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Type of the party
 */
public enum class PartyType(
  public val `value`: String,
) {
  @SerialName("balance_responsible_party")
  BALANCE_RESPONSIBLE_PARTY("balance_responsible_party"),
  @SerialName("energy_supplier")
  ENERGY_SUPPLIER("energy_supplier"),
  @SerialName("service_provider")
  SERVICE_PROVIDER("service_provider"),
  @SerialName("system_operator")
  SYSTEM_OPERATOR("system_operator"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, PartyType> = entries.associateBy(PartyType::value)

    public fun fromValue(`value`: String): PartyType? = mapping[value]
  }
}
