package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The end user on the accounting point where the controllable units are located.
 */
@Serializable
public data class AccountingPointEndUser(
  /**
   * Surrogate key of the end user.
   */
  @SerialName("id")
  public val id: Int,
)
