package no.elhub.flex.routes.accountingpoint

import arrow.core.raise.either
import io.ktor.http.HttpStatusCode
import io.ktor.server.routing.RoutingCall
import no.elhub.flex.accountingpoint.AccountingPointGridLocationService
import no.elhub.flex.accountingpoint.AccountingPointService
import no.elhub.flex.auth.flexPrincipal
import no.elhub.flex.model.domain.AccountingPointGridLocation
import no.elhub.flex.model.dto.generated.models.AccountingPointGridLocationCreateRequest
import no.elhub.flex.model.dto.generated.models.AccountingPointGridLocationObjectType
import no.elhub.flex.model.dto.generated.models.AccountingPointGridLocationQuality
import no.elhub.flex.model.dto.generated.models.AccountingPointGridLocationResponse
import no.elhub.flex.model.dto.generated.models.AccountingPointGridLocationSource
import no.elhub.flex.model.dto.generated.models.AccountingPointGridLocationUpdateRequest
import no.elhub.flex.util.body
import no.elhub.flex.util.longParameter
import no.elhub.flex.util.respondJson
import org.koin.core.annotation.Single

@Single(createdAtStart = true)
class AccountingPointGridLocationHandler(
    val accountingPointService: AccountingPointService,
    val gridLocationService: AccountingPointGridLocationService,
) {
    suspend fun read(call: RoutingCall) {
        either {
            with(call.flexPrincipal()) {
                val accountingPointId = call.longParameter("accountingPointId").bind()
                gridLocationService.getByAccountingPointId(accountingPointId).bind().toResponse()
            }
        }.respondJson(call)
    }

    suspend fun create(call: RoutingCall) {
        either {
            with(call.flexPrincipal()) {
                val accountingPointId = call.longParameter("accountingPointId").bind()
                accountingPointService.getById(accountingPointId).bind()

                val request = call.body<AccountingPointGridLocationCreateRequest>().bind()
                gridLocationService.create(accountingPointId, request).bind().toResponse()
            }
        }.respondJson(call, HttpStatusCode.Created)
    }

    suspend fun update(call: RoutingCall) {
        either {
            with(call.flexPrincipal()) {
                val accountingPointId = call.longParameter("accountingPointId").bind()
                accountingPointService.getById(accountingPointId).bind()

                val request = call.body<AccountingPointGridLocationUpdateRequest>().bind()
                gridLocationService.update(accountingPointId, request).bind().toResponse()
            }
        }.respondJson(call)
    }
}

private fun AccountingPointGridLocation.toResponse(): AccountingPointGridLocationResponse =
    AccountingPointGridLocationResponse(
        id = id,
        accountingPointId = accountingPointId,
        objectType = AccountingPointGridLocationObjectType.fromValue(objectType.value)!!,
        businessId = businessId,
        name = name,
        nominalVoltage = nominalVoltage,
        additionalInformation = additionalInformation,
        source = AccountingPointGridLocationSource.fromValue(source.value)!!,
        quality = AccountingPointGridLocationQuality.fromValue(quality.value)!!,
        recordedAt = recordedAt,
        recordedBy = recordedBy,
    )
