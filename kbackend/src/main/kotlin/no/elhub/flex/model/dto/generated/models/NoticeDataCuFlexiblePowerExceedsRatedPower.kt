package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Format of the data field in a notice with data.kind =
 * notice.data.cu.flexible_power_exceeds_rated_power
 */
@SerialName("notice.data.cu.flexible_power_exceeds_rated_power")
@Serializable
public data class NoticeDataCuFlexiblePowerExceedsRatedPower(
  /**
   * The flexible power of the controllable unit in kW.
   */
  @Contextual
  @SerialName("maximum_active_power")
  public val maximumActivePower: BigDecimal? = null,
  /**
   * The combined maximum active power of all technical resources in kW.
   */
  @Contextual
  @SerialName("rated_power")
  public val ratedPower: BigDecimal? = null,
) : NoticeData
