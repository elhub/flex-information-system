package no.elhub.flex.api.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Int
import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Format of the data field in a notice with data.kind =
 * notice.data.service_providing_group_grid_prequalification.outdated
 */
@SerialName("notice.data.service_providing_group_grid_prequalification.outdated")
@Serializable
public data class NoticeDataServiceProvidingGroupGridPrequalificationOutdated(
  /**
   * The service providing group that changed.
   */
  @SerialName("service_providing_group_id")
  public val serviceProvidingGroupId: Long? = null,
  /**
   * When the service providing group was last grid prequalified. The changes are computed relative
   * to the state at this time.
   */
  @SerialName("prequalified_at")
  public val prequalifiedAt: Instant? = null,
  /**
   * Number of controllable units added since the grid prequalification.
   */
  @SerialName("added")
  public val added: Int? = null,
  /**
   * Number of controllable units removed since the grid prequalification.
   */
  @SerialName("removed")
  public val removed: Int? = null,
  /**
   * Number of controllable units whose maximum active power changed since the grid
   * prequalification.
   */
  @SerialName("changed")
  public val changed: Int? = null,
  /**
   * Net change in maximum active power (kW) of the controllable units under the system operator
   * since the grid prequalification.
   */
  @Contextual
  @SerialName("maximum_active_power_diff")
  public val maximumActivePowerDiff: BigDecimal? = null,
) : NoticeData
