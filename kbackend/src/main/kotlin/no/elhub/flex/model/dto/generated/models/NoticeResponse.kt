package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Notice to users about various issues or actions expected from them.
 */
@Serializable
public data class NoticeResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * The status of the notice.
   */
  @SerialName("status")
  public val status: NoticeStatus,
  /**
   * Reference to the party targeted by the notice.
   */
  @SerialName("party_id")
  public val partyId: Int? = null,
  /**
   * The type of the notice.
   */
  @SerialName("type")
  public val type: String? = null,
  /**
   * The URI of the resource concerned by the event.
   */
  @SerialName("source")
  public val source: String? = null,
  @SerialName("data")
  public val `data`: NoticeData? = null,
  /**
   * When the resource was recorded (created or updated) in the system.
   */
  @SerialName("recorded_at")
  public val recordedAt: Instant? = null,
  /**
   * The identity that recorded the resource.
   */
  @SerialName("recorded_by")
  public val recordedBy: Int? = null,
)
