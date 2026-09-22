package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Indicates how the grid location was determined. Guessed means that Flexibility Information System
 * has estimated the location, while confirmed means that someone has verified it.
 */
public enum class AccountingPointGridLocationQuality(
  public val `value`: String,
) {
  @SerialName("confirmed")
  CONFIRMED("confirmed"),
  @SerialName("guessed")
  GUESSED("guessed"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, AccountingPointGridLocationQuality> =
        entries.associateBy(AccountingPointGridLocationQuality::value)

    public fun fromValue(`value`: String): AccountingPointGridLocationQuality? = mapping[value]
  }
}
