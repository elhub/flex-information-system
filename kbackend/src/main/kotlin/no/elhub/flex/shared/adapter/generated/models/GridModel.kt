package no.elhub.flex.shared.adapter.generated.models

import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class GridModel(
  @SerialName("substations")
  public val substations: List<Substation>,
  @SerialName("substation_clusters")
  public val substationClusters: List<SubstationCluster>,
  @SerialName("lines")
  public val lines: List<Line>,
)
