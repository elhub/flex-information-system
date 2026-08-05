package no.elhub.flex.model.domain

import kotlinx.datetime.LocalDate
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Technical resource nested inside a [ControllableUnitForLookup]. */
@Serializable
data class TechnicalResource(
    val id: Long,
    val name: String,
)

@Serializable
data class ControllableUnitForLookup(
    val id: Long,
    @SerialName("business_id") val businessId: String,
    val name: String,
    @SerialName("technical_resources") val technicalResources: List<TechnicalResource>,
    @SerialName("start_date") val startDate: LocalDate?,
)
