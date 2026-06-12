package no.elhub.flex.integration.accountingpointadapter.generated.models

import java.math.BigDecimal
import kotlin.String
import kotlin.collections.List
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class AccountingPoint(
  /**
   * Global Service Relation Number (GSRN) - unique identifier for the accounting point
   */
  @SerialName("gsrn")
  public val gsrn: String,
  /**
   * Time-dependent list of end users associated with this accounting point
   */
  @SerialName("end_user")
  public val endUser: List<EndUser>,
  /**
   * Time-dependent list of energy suppliers associated with this accounting point
   */
  @SerialName("energy_supplier")
  public val energySupplier: List<EnergySupplier>,
  /**
   * Time-dependent list of metering grid areas associated with this accounting point
   */
  @SerialName("metering_grid_area")
  public val meteringGridArea: List<MeteringGridArea>,
  /**
   * Time-dependent list of energy directions associated with this accounting point
   */
  @SerialName("energy_direction")
  public val energyDirection: List<EnergyDirection>? = null,
  /**
   * Geographic latitude of the accounting point (WGS84).
   */
  @Contextual
  @SerialName("latitude")
  public val latitude: BigDecimal? = null,
  /**
   * Geographic longitude of the accounting point (WGS84).
   */
  @Contextual
  @SerialName("longitude")
  public val longitude: BigDecimal? = null,
)
