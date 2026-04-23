package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class NumericAggregation(
  @Contextual
  @SerialName("sum")
  public val sum: BigDecimal? = null,
  @Contextual
  @SerialName("average")
  public val average: BigDecimal? = null,
  @Contextual
  @SerialName("min")
  public val min: BigDecimal? = null,
  @Contextual
  @SerialName("max")
  public val max: BigDecimal? = null,
)
