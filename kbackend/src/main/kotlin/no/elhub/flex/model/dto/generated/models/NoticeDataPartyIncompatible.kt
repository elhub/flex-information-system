package no.elhub.flex.model.dto.generated.models

import kotlin.Long
import kotlin.collections.List
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Format of the data field in a notice with data.kind = notice.data.party.incompatible
 */
@SerialName("notice.data.party.incompatible")
@Serializable
public data class NoticeDataPartyIncompatible(
  /**
   * ID of the entity with access to incompatible parties.
   */
  @SerialName("entity")
  public val entity: Long? = null,
  /**
   * IDs of the incompatible parties the entity owns or is a member of.
   */
  @SerialName("party")
  public val party: List<Long>? = null,
) : NoticeData
