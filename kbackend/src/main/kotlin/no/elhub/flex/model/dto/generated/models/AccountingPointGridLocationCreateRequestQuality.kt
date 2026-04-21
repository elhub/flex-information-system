package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The quality of the grid location registration.
 */
public enum class AccountingPointGridLocationCreateRequestQuality(
  public val `value`: String,
) {
  @SerialName("confirmed")
  CONFIRMED("confirmed"),
  @SerialName("guessed")
  GUESSED("guessed"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, AccountingPointGridLocationCreateRequestQuality> =
        entries.associateBy(AccountingPointGridLocationCreateRequestQuality::value)

    public fun fromValue(`value`: String): AccountingPointGridLocationCreateRequestQuality? =
        mapping[value]
  }
}
