package no.elhub.flex.model.domain

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Technical resource nested inside a [ControllableUnit]. */
@Serializable
data class TechnicalResource(
    val id: Int,
    val name: String,
    val details: String? = null,
)

@Serializable
data class ControllableUnit(
    val id: Int,
    @SerialName("business_id") val businessId: String,
    val name: String,
    @SerialName("technical_resources") val technicalResources: List<TechnicalResource>,
)
