package no.elhub.flex.model.dto.generated.models

import kotlin.Int
import kotlin.String
import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Response schema - Event happening in the system.
 */
@Serializable
public data class EventResponse(
  /**
   * Unique surrogate identifier.
   */
  @SerialName("id")
  public val id: Int? = null,
  /**
   * The version of the CloudEvents specification followed by the resource.
   */
  @SerialName("specversion")
  public val specversion: String? = null,
  /**
   * The time at which the event was generated.
   */
  @SerialName("time")
  public val time: Instant? = null,
  /**
   * The type of the event.
   */
  @SerialName("type")
  public val type: String? = null,
  /**
   * The URI of the resource concerned by the event.
   */
  @SerialName("source")
  public val source: String? = null,
  /**
   * The URI of the specific subject of the event within the resource pointed by `source`.
   */
  @SerialName("subject")
  public val subject: String? = null,
  /**
   * The data of the event.
   */
  @SerialName("data")
  public val `data`: String? = null,
)
