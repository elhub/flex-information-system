package no.elhub.flex.shared.adapter.generated.models

import java.util.UUID
import kotlin.Double
import kotlin.String
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class SubstationCluster(
  @Contextual
  @SerialName("mrid")
  public val mrid: UUID,
  @SerialName("name")
  public val name: String,
  @SerialName("latitude")
  public val latitude: Double,
  @SerialName("longitude")
  public val longitude: Double,
)
