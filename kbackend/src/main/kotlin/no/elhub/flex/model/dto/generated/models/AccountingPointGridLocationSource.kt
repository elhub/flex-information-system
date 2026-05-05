package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * How the grid location was determined.  When a system operator creates or updates a grid location,
 * this field is set automatically:  `cso` if the SO is the connecting system operator, `so` otherwise.
 */
public enum class AccountingPointGridLocationSource(
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
    private val mapping: Map<String, AccountingPointGridLocationSource> =
        entries.associateBy(AccountingPointGridLocationSource::value)

    public fun fromValue(`value`: String): AccountingPointGridLocationSource? = mapping[value]
  }
}
