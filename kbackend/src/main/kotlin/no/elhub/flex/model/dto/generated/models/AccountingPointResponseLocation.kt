package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.collections.List
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Geographic location of the accounting point (WGS84), as a GeoJSON point object.
 */
@Serializable
public data class AccountingPointResponseLocation(
  @SerialName("type")
  public val type: LocationType? = null,
  @SerialName("crs")
  public val crs: AccountingPointResponseCrs? = null,
  /**
   * [longitude, latitude] in decimal degrees (WGS84)
   */
  @SerialName("coordinates")
  public val coordinates: List<@Contextual BigDecimal>? = null,
)
