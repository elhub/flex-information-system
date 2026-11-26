package no.elhub.flex.shared.adapter.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Type of the end user entity, either a person or an organisation.
 */
public enum class AccountingPointEndUserEntityType(
  public val `value`: String,
) {
  @SerialName("person")
  PERSON("person"),
  @SerialName("organisation")
  ORGANISATION("organisation"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, AccountingPointEndUserEntityType> =
        entries.associateBy(AccountingPointEndUserEntityType::value)

    public fun fromValue(`value`: String): AccountingPointEndUserEntityType? = mapping[value]
  }
}
