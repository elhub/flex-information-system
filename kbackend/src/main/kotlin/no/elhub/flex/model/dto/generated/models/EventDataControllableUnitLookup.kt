package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Format of the data field in a controllable_unit.lookup event.
 */
@SerialName("event.data.controllable_unit.lookup")
@Serializable
public data class EventDataControllableUnitLookup(
  /**
   * The party that performed the controllable unit lookup.
   */
  @SerialName("requesting_party_id")
  public val requestingPartyId: Long,
) : EventData
