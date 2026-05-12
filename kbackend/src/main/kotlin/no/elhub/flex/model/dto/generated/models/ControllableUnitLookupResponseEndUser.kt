package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The end user on the accounting point where the controllable units are located.
 */
@Serializable
public data class ControllableUnitLookupResponseEndUser(
  /**
   * The surrogate key of the end user.
   */
  @SerialName("id")
  public val id: Long,
)
