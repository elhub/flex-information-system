package no.elhub.flex.auth.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The auth role in the Flexibility Information System
 */
public enum class FlexRole(
  public val `value`: String,
) {
  @SerialName("flex_anonymous")
  FLEX_ANONYMOUS("flex_anonymous"),
  @SerialName("flex_balance_responsible_party")
  FLEX_BALANCE_RESPONSIBLE_PARTY("flex_balance_responsible_party"),
  @SerialName("flex_end_user")
  FLEX_END_USER("flex_end_user"),
  @SerialName("flex_energy_supplier")
  FLEX_ENERGY_SUPPLIER("flex_energy_supplier"),
  @SerialName("flex_entity")
  FLEX_ENTITY("flex_entity"),
  @SerialName("flex_flexibility_information_system_operator")
  FLEX_FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR("flex_flexibility_information_system_operator"),
  @SerialName("flex_market_operator")
  FLEX_MARKET_OPERATOR("flex_market_operator"),
  @SerialName("flex_organisation")
  FLEX_ORGANISATION("flex_organisation"),
  @SerialName("flex_system_operator")
  FLEX_SYSTEM_OPERATOR("flex_system_operator"),
  @SerialName("flex_service_provider")
  FLEX_SERVICE_PROVIDER("flex_service_provider"),
  @SerialName("flex_third_party")
  FLEX_THIRD_PARTY("flex_third_party"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, FlexRole> = entries.associateBy(FlexRole::value)

    public fun fromValue(`value`: String): FlexRole? = mapping[value]
  }
}
