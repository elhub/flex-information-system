package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The level of visibility of the comment.
 */
public enum class ServiceProvidingGroupGridPrequalificationCommentVisibility(
  public val `value`: String,
) {
  @SerialName("same_party")
  SAME_PARTY("same_party"),
  @SerialName("any_involved_party")
  ANY_INVOLVED_PARTY("any_involved_party"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, ServiceProvidingGroupGridPrequalificationCommentVisibility> =
        entries.associateBy(ServiceProvidingGroupGridPrequalificationCommentVisibility::value)

    public fun fromValue(`value`: String):
        ServiceProvidingGroupGridPrequalificationCommentVisibility? = mapping[value]
  }
}
