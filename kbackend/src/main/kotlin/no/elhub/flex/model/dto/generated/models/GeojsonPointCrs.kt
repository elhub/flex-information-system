package no.elhub.flex.model.dto.generated.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class GeojsonPointCrs(
  @SerialName("type")
  public val type: CrsType,
  @SerialName("properties")
  public val properties: GeojsonPointProperties,
)
