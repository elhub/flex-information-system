package no.elhub.flex.model.dto.generated.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public data class AccountingPointResponseCrs(
  @SerialName("type")
  public val type: CrsType? = null,
  @SerialName("properties")
  public val properties: AccountingPointResponseProperties? = null,
)
