package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The type of object in the common grid model that the accounting point is at.
 */
public enum class AccountingPointGridLocationCreateRequestObjectType(
  public val `value`: String,
) {
  @SerialName("substation")
  SUBSTATION("substation"),
  @SerialName("transformer")
  TRANSFORMER("transformer"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, AccountingPointGridLocationCreateRequestObjectType> =
        entries.associateBy(AccountingPointGridLocationCreateRequestObjectType::value)

    public fun fromValue(`value`: String): AccountingPointGridLocationCreateRequestObjectType? =
        mapping[value]
  }
}
