package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The quality of the grid location registration.
 */
public enum class AccountingPointGridLocationUpdateRequestQuality(
  public val `value`: String,
) {
  @SerialName("confirmed")
  CONFIRMED("confirmed"),
  @SerialName("guessed")
  GUESSED("guessed"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, AccountingPointGridLocationUpdateRequestQuality> =
        entries.associateBy(AccountingPointGridLocationUpdateRequestQuality::value)

    public fun fromValue(`value`: String): AccountingPointGridLocationUpdateRequestQuality? =
        mapping[value]
  }
}
