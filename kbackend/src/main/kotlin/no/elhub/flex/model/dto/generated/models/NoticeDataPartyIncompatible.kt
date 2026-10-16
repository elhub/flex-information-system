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
   * Groups of parties the entity owns or is a member of. Each item is the list of IDs of the
   * parties in one group. Parties from different groups are incompatible with each other.
   */
  @SerialName("party_groups")
  public val partyGroups: List<List<Long>>? = null,
) : NoticeData
