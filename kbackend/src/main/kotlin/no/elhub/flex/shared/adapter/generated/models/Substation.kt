package no.elhub.flex.shared.adapter.generated.models

import java.util.UUID
import kotlin.Double
import kotlin.String
import kotlin.collections.List
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class Substation(
  @Contextual
  @SerialName("mrid")
  public val mrid: UUID,
  @SerialName("name")
  public val name: String,
  /**
   * Kind of substation, as given by the grid model source.
   */
  @SerialName("kind")
  public val kind: String,
  /**
   * Name and organisation number of the primary concessionaire.
   */
  @SerialName("primary_concessionaire")
  public val primaryConcessionaire: String,
  @Contextual
  @SerialName("substation_cluster_mrid")
  public val substationClusterMrid: UUID,
  /**
   * Nominal voltages of the substation.
   */
  @SerialName("voltage_levels")
  public val voltageLevels: List<Double>,
  @SerialName("latitude")
  public val latitude: Double,
  @SerialName("longitude")
  public val longitude: Double,
)
