package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Common format of the data field in events concerning update operations.
 */
@SerialName("event.data.updated_fields")
@Serializable
public data class EventDataUpdatedFields(
  /**
   * Names of the fields that were modified by the update.
   */
  @SerialName("updated_fields")
  public val updatedFields: List<String>,
) : EventData
