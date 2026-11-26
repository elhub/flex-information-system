package no.elhub.flex.shared.adapter.generated.models

import java.util.UUID
import kotlin.String
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class Line(
  @Contextual
  @SerialName("mrid")
  public val mrid: UUID,
  @SerialName("name")
  public val name: String,
  @Contextual
  @SerialName("from_substation_cluster_mrid")
  public val fromSubstationClusterMrid: UUID,
  @Contextual
  @SerialName("to_substation_cluster_mrid")
  public val toSubstationClusterMrid: UUID,
)
