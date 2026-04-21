package no.elhub.flex.model.domain

import java.math.BigDecimal
import kotlin.time.Instant

enum class GridLocationObjectType(val value: String) {
    SUBSTATION("substation"),
    TRANSFORMER("transformer"),
    ;

    companion object {
        fun fromString(str: String): GridLocationObjectType =
            entries.first { it.value == str }
    }
}

enum class GridLocationSource(val value: String) {
    CSO("cso"),
    SO("so"),
    GRID_MODEL("grid_model"),
    SYSTEM("system"),
    ;

    companion object {
        fun fromString(str: String): GridLocationSource =
            entries.first { it.value == str }
    }
}

enum class GridLocationQuality(val value: String) {
    CONFIRMED("confirmed"),
    GUESSED("guessed"),
    ;

    companion object {
        fun fromString(str: String): GridLocationQuality =
            entries.first { it.value == str }
    }
}

data class AccountingPointGridLocation(
    val id: Long,
    val accountingPointId: Long,
    val objectType: GridLocationObjectType,
    val businessId: String?,
    val name: String,
    val nominalVoltage: BigDecimal,
    val additionalInformation: String?,
    val source: GridLocationSource,
    val quality: GridLocationQuality,
    val recordedAt: Instant?,
    val recordedBy: Long?,
)
