package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * How the grid location was determined. Derived in the backend from the requester's identity, but
 * must be provided explicitly to be stored.
 */
public enum class AccountingPointGridLocationCreateRequestSource(
  public val `value`: String,
) {
  @SerialName("cso")
  CSO("cso"),
  @SerialName("so")
  SO("so"),
  @SerialName("grid_model")
  GRID_MODEL("grid_model"),
  @SerialName("system")
  SYSTEM("system"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, AccountingPointGridLocationCreateRequestSource> =
        entries.associateBy(AccountingPointGridLocationCreateRequestSource::value)

    public fun fromValue(`value`: String): AccountingPointGridLocationCreateRequestSource? =
        mapping[value]
  }
}
