package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Resource category classification. Derived from technologies.
 */
public enum class Category(
  public val `value`: String,
) {
  @SerialName("consumption")
  CONSUMPTION("consumption"),
  @SerialName("production")
  PRODUCTION("production"),
  @SerialName("energy_storage")
  ENERGY_STORAGE("energy_storage"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, Category> = entries.associateBy(Category::value)

    public fun fromValue(`value`: String): Category? = mapping[value]
  }
}
