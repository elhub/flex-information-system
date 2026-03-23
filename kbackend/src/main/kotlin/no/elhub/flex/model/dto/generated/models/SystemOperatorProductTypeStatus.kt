package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * The status of the relation.
 */
public enum class SystemOperatorProductTypeStatus(
  public val `value`: String,
) {
  @SerialName("active")
  ACTIVE("active"),
  @SerialName("inactive")
  INACTIVE("inactive"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, SystemOperatorProductTypeStatus> =
        entries.associateBy(SystemOperatorProductTypeStatus::value)

    public fun fromValue(`value`: String): SystemOperatorProductTypeStatus? = mapping[value]
  }
}
