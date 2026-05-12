package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The role of the party. Currently maps to 1:1 to `type`. E.g. system_operator, service_provider.
 */
public enum class PartyRole(
  public val `value`: String,
) {
  @SerialName("flex_balance_responsible_party")
  FLEX_BALANCE_RESPONSIBLE_PARTY("flex_balance_responsible_party"),
  @SerialName("flex_end_user")
  FLEX_END_USER("flex_end_user"),
  @SerialName("flex_energy_supplier")
  FLEX_ENERGY_SUPPLIER("flex_energy_supplier"),
  @SerialName("flex_flexibility_information_system_operator")
  FLEX_FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR("flex_flexibility_information_system_operator"),
  @SerialName("flex_market_operator")
  FLEX_MARKET_OPERATOR("flex_market_operator"),
  @SerialName("flex_organisation")
  FLEX_ORGANISATION("flex_organisation"),
  @SerialName("flex_service_provider")
  FLEX_SERVICE_PROVIDER("flex_service_provider"),
  @SerialName("flex_system_operator")
  FLEX_SYSTEM_OPERATOR("flex_system_operator"),
  @SerialName("flex_third_party")
  FLEX_THIRD_PARTY("flex_third_party"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, PartyRole> = entries.associateBy(PartyRole::value)

    public fun fromValue(`value`: String): PartyRole? = mapping[value]
  }
}
