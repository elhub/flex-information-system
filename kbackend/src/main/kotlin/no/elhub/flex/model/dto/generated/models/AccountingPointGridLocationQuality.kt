package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The quality of the grid location registration.
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
