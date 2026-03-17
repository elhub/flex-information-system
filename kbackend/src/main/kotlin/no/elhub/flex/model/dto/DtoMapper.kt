package no.elhub.flex.model.dto

import no.elhub.flex.model.domain.ControllableUnit
import no.elhub.flex.model.domain.TechnicalResource
import no.elhub.flex.model.dto.generated.models.ControllableUnit as ControllableUnitDto
import no.elhub.flex.model.dto.generated.models.TechnicalResource as TechnicalResourceDto

@JvmName("toControllableUnitDtos")
fun List<ControllableUnit>.toDtos(): List<ControllableUnitDto> =
    this.map { cu ->
        ControllableUnitDto(
            id = cu.id,
            businessId = cu.businessId,
            name = cu.name,
            technicalResources = cu.technicalResources.toDtos()

        )
    }

@JvmName("toTechnicalResourceDtos")
fun List<TechnicalResource>.toDtos(): List<TechnicalResourceDto> =
    this.map { tr ->
        TechnicalResourceDto(
            id = tr.id,
            name = tr.name,
            details = tr.details,
        )
    }
