package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.collections.List
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class GeojsonPoint(
  @SerialName("type")
  public val type: GeojsonPointType,
  @SerialName("crs")
  public val crs: GeojsonPointCrs,
  /**
   * [longitude, latitude] in decimal degrees (WGS84)
   */
  @SerialName("coordinates")
  public val coordinates: List<@Contextual BigDecimal>,
)
