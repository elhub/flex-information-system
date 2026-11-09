package no.elhub.flex.api.model.dto.generated.models

import kotlin.String
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Format of the data field in a notice with data.kind =
 * notice.data.controllable_unit.cso.no_active_users
 */
@SerialName("notice.data.controllable_unit.cso.no_active_users")
@Serializable
public data class NoticeDataControllableUnitCsoNoActiveUsers(
  /**
   * Name of the controllable unit.
   */
  @SerialName("controllable_unit_name")
  public val controllableUnitName: String? = null,
  /**
   * Name of the connecting system operator that has no active users.
   */
  @SerialName("connecting_system_operator_name")
  public val connectingSystemOperatorName: String? = null,
) : NoticeData
