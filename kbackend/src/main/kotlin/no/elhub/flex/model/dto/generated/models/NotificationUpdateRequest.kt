package no.elhub.flex.model.dto.generated.models

import kotlin.Boolean
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for update operations - Notification about an event happening in the system.
 */
@Serializable
public data class NotificationUpdateRequest(
  /**
   * Whether the notification was acknowledged by the target user.
   */
  @SerialName("acknowledged")
  public val acknowledged: Boolean? = null,
)
