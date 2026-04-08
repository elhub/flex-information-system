package no.elhub.flex.model.dto.generated.models

import kotlin.Boolean
import kotlin.Long
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Notification about an event happening in the system.
 */
@Serializable
public data class NotificationResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Long? = null,
  /**
   * Whether the notification was acknowledged by the target user.
   */
  @SerialName("acknowledged")
  public val acknowledged: Boolean,
  /**
   * Reference to the event notified by this resource.
   */
  @SerialName("event_id")
  public val eventId: Long,
  /**
   * Reference to the party concerned by this notification.
   */
  @SerialName("party_id")
  public val partyId: Long,
  /**
   * When the resource was recorded (created or updated) in the system.
   */
  @SerialName("recorded_at")
  public val recordedAt: Instant? = null,
  /**
   * The identity that recorded the resource.
   */
  @SerialName("recorded_by")
  public val recordedBy: Long? = null,
)
