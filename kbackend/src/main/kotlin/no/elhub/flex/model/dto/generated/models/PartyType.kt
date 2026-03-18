package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of the party, e.g SystemOperator, ServiceProvider
 */
public enum class PartyType(
  public val `value`: String,
) {
  @SerialName("balance_responsible_party")
  BALANCE_RESPONSIBLE_PARTY("balance_responsible_party"),
  @SerialName("end_user")
  END_USER("end_user"),
  @SerialName("energy_supplier")
  ENERGY_SUPPLIER("energy_supplier"),
  @SerialName("flexibility_information_system_operator")
  FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR("flexibility_information_system_operator"),
  @SerialName("market_operator")
  MARKET_OPERATOR("market_operator"),
  @SerialName("organisation")
  ORGANISATION("organisation"),
  @SerialName("service_provider")
  SERVICE_PROVIDER("service_provider"),
  @SerialName("system_operator")
  SYSTEM_OPERATOR("system_operator"),
  @SerialName("third_party")
  THIRD_PARTY("third_party"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, PartyType> = entries.associateBy(PartyType::value)

    public fun fromValue(`value`: String): PartyType? = mapping[value]
  }
}
