package no.elhub.flex.model.domain

import kotlinx.datetime.LocalDate
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Technical resource nested inside a [ControllableUnit]. */
@Serializable
data class TechnicalResource(
    val id: Int,
    val name: String,
)

@Serializable
data class ControllableUnit(
    val id: Int,
    @SerialName("business_id") val businessId: String,
    val name: String,
    @SerialName("technical_resources") val technicalResources: List<TechnicalResource>,
    @SerialName("start_date") val startDate: LocalDate,
)
