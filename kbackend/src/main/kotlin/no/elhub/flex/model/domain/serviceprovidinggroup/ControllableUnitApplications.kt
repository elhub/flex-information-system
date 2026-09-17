package no.elhub.flex.model.domain.serviceprovidinggroup

import java.time.OffsetDateTime

data class ControllableUnitApplications(
    val id: Long,
    val name: String,
    val serviceProvidingGroupId: Long,
    val gridPrequalification: ControllableUnitGridPrequalification?,
    val productApplications: List<ControllableUnitProductApplication>,
)

data class ControllableUnitGridPrequalification(
    val id: Long,
    val prequalifiedAt: OffsetDateTime?,
)
data class ControllableUnitProductApplication(
    val id: Long,
    val prequalifiedAt: OffsetDateTime?,
)
