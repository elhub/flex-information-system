package no.elhub.flex.model.domain

import kotlinx.datetime.LocalDate
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import no.elhub.flex.util.BigDecimalSerializer
import java.math.BigDecimal

@Serializable
data class ControllableUnit(
    val id: Long,
    @SerialName("business_id")
    val businessId: String,
    val name: String,
    @SerialName("start_date")
    val startDate: LocalDate?,
    val status: ControllableUnitStatus,
    @SerialName("regulation_direction")
    val regulationDirection: RegulationDirection,
    @Serializable(with = BigDecimalSerializer::class)
    val maximumActivePower: BigDecimal,
    val isSmall: Boolean,
    @SerialName("additional_information")
    val additionalInformation: String?,
    @SerialName("accounting_point_id")
    val accountingPointId: Long,
    @SerialName("created_by_party_id")
    val createdByPartyId: Long,

)

enum class RegulationDirection(val direction: String) {
    @SerialName("up")
    UP("up"),

    @SerialName("down")
    DOWN("down"),

    @SerialName("both")
    BOTH("both");

    companion object {
        private val mapping: Map<String, RegulationDirection> =
            entries.associateBy(RegulationDirection::direction)

        fun fromValue(`value`: String): RegulationDirection =
            mapping[value] ?: throw IllegalArgumentException("Unknown regulation direction '$value'")
    }
}

/**
 * The status of the controllable unit.
 */
enum class ControllableUnitStatus(
    val status: String,
) {
    @SerialName("new")
    NEW("new"),

    @SerialName("active")
    ACTIVE("active"),

    @SerialName("inactive")
    INACTIVE("inactive"),

    @SerialName("terminated")
    TERMINATED("terminated"),
    ;

    companion object {
        private val mapping: Map<String, ControllableUnitStatus> =
            entries.associateBy(ControllableUnitStatus::status)

        fun fromValue(`value`: String): ControllableUnitStatus = mapping[value] ?: throw IllegalArgumentException("Unknown status '$value'")
    }
}
