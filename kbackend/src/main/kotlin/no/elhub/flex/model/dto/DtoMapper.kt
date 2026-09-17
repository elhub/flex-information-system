package no.elhub.flex.model.dto

import no.elhub.flex.model.domain.ControllableUnitForLookup
import no.elhub.flex.model.domain.TechnicalResource
import no.elhub.flex.model.domain.serviceprovidinggroup.ControllableUnitApplications
import no.elhub.flex.model.dto.generated.models.ServiceProvidingGroupControllableUnitsApplicationsResponse
import no.elhub.flex.model.dto.generated.models.ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification
import no.elhub.flex.model.dto.generated.models.ServiceProvidingGroupControllableUnitsApplicationsResponseProductApplications
import no.elhub.flex.util.toKotlinInstantOrNull
import no.elhub.flex.model.dto.generated.models.ControllableUnitLookupResponseControllableUnits as ControllableUnitDto
import no.elhub.flex.model.dto.generated.models.ControllableUnitLookupResponseTechnicalResources as TechnicalResourceDto

@JvmName("toControllableUnitDtos")
fun List<ControllableUnitForLookup>.toDtos(): List<ControllableUnitDto> =
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
        )
    }

fun List<ControllableUnitApplications>.toDtos(): List<ServiceProvidingGroupControllableUnitsApplicationsResponse> =
    this.map { cu ->
        ServiceProvidingGroupControllableUnitsApplicationsResponse(
            id = cu.id,
            name = cu.name,
            serviceProvidingGroupId = cu.serviceProvidingGroupId,
            gridPrequalification = cu.gridPrequalification?.let {
                ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification(
                    id = it.id,
                    prequalifiedAt = it.prequalifiedAt.toKotlinInstantOrNull(),
                )
            },
            productApplications = cu.productApplications.map {
                ServiceProvidingGroupControllableUnitsApplicationsResponseProductApplications(
                    id = it.id,
                    prequalifiedAt = it.prequalifiedAt.toKotlinInstantOrNull(),
                )
            },
        )
    }
