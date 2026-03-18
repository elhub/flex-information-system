package no.elhub.flex.model.dto.generated.models

import kotlin.time.Instant
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Partial timeline data that is relevant to mention, in a notice for instance. Multirange format,
 * i.e., array of start/end timestamp pairs.
 */
@Serializable
public data class TimelineMultiRange(
  /**
   * The start time of the timeline section.
   */
  @SerialName("valid_from")
  public val validFrom: Instant? = null,
  /**
   * The end time of the timeline section.
   */
  @SerialName("valid_to")
  public val validTo: Instant? = null,
)
