package no.elhub.flex.routes.controllableunit

import arrow.core.Either
import arrow.core.left
import arrow.core.raise.either
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.request.receive
import io.ktor.server.routing.RoutingCall
import no.elhub.flex.accountingpoint.AccountingPointService
import no.elhub.flex.auth.AccessTokenKey
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.auth.toFlexPrincipal
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.model.domain.ControllableUnit
import no.elhub.flex.model.domain.GSRN
import no.elhub.flex.model.dto.generated.models.ControllableUnitLookupRequest
import no.elhub.flex.model.dto.generated.models.ControllableUnitLookupResponse
import no.elhub.flex.model.dto.generated.models.ControllableUnitLookupResponseAccountingPoint
import no.elhub.flex.model.dto.generated.models.ControllableUnitLookupResponseEndUser
import no.elhub.flex.model.dto.toDtos
import no.elhub.flex.model.error.AppError
import no.elhub.flex.model.error.BadRequestError
import no.elhub.flex.model.error.InternalServerError
import no.elhub.flex.util.TraceIdUtil.Companion.traceIdOrUnknown
import no.elhub.flex.util.asLocalStartOfDayInstant
import no.elhub.flex.util.atLocalStartOfToday
import no.elhub.flex.util.respondJson
import org.koin.core.annotation.Single
import kotlin.time.Instant

private val logger = KotlinLogging.logger {}

private val END_USER_REGEX = Regex("^[1-9]([0-9]{8}|[0-9]{10})$")
private val CONTROLLABLE_UNIT_BUSINESS_ID_REGEX =
    Regex("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")

@Single(createdAtStart = true)
class ControllableUnitLookup(
    private val repo: ControllableUnitRepository,
    private val accountingPointService: AccountingPointService,
) {
    suspend fun handle(call: RoutingCall) {
        val token = call.attributes[AccessTokenKey]
        val principal = token.toFlexPrincipal()
        with(principal) {
            either {
                val request = parseBody(call).bind()
                    .let { validateInput(it).bind() }

                val accountingPointBusinessId = request.accountingPointBusinessId?.value
                    ?: accountingPointService.getCurrentAccountingPoint(request.controllableUnitBusinessId).bind().businessId

                val controllableUnits = fetchControllableUnits(
                    request.controllableUnitBusinessId,
                    accountingPointBusinessId
                ).bind()

                val validFrom = controllableUnits.minByOrNull { it.startDate }?.startDate?.asLocalStartOfDayInstant()
                    ?: Instant.atLocalStartOfToday()

                accountingPointService.synchronizeAccountingPoint(accountingPointBusinessId, validFrom).bind()

                val endUserId = accountingPointService.checkEndUserMatchesAccountingPoint(
                    request.endUser,
                    accountingPointBusinessId
                ).bind()
                val accountingPoint = accountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId).bind()

                ControllableUnitLookupResponse(
                    accountingPoint = ControllableUnitLookupResponseAccountingPoint(
                        id = accountingPoint.id,
                        businessId = accountingPoint.businessId
                    ),
                    endUser = ControllableUnitLookupResponseEndUser(id = endUserId),
                    controllableUnits = controllableUnits.toDtos(),
                )
            }
        }.respondJson(call)
    }

    private suspend fun parseBody(call: RoutingCall): Either<BadRequestError, ControllableUnitLookupRequest> =
        runCatching { call.receive<ControllableUnitLookupRequest>() }.fold(
            onSuccess = { it.right() },
            onFailure = { e ->
                logger.info { "Could not parse CU lookup request body: ${e.message}" }
                BadRequestError("Could not parse request body.").left()
            },
        )

    context(principal: FlexPrincipal)
    private suspend fun fetchControllableUnits(
        controllableUnitBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<AppError, List<ControllableUnit>> =
        repo.lookupControllableUnits(controllableUnitBusinessId, accountingPointBusinessId)
            .mapLeft { _ ->
                InternalServerError(traceIdOrUnknown())
            }
}

/** Validates the request body and returns a sanitised copy or an [BadRequestError]. */
private fun validateInput(req: ControllableUnitLookupRequest): Either<BadRequestError, ValidatedRequest> = either {
    val endUser = req.endUser

    if (endUser.isEmpty()) raise(BadRequestError("missing end user business ID"))
    if (!END_USER_REGEX.matches(endUser)) raise(BadRequestError("ill formed end user business ID"))

    val controllableUnitId = req.controllableUnit.orEmpty()
    if (controllableUnitId.isNotEmpty() && !CONTROLLABLE_UNIT_BUSINESS_ID_REGEX.matches(controllableUnitId)) {
        raise(BadRequestError("ill formed controllable unit business ID"))
    }

    val accountingPointId = req.accountingPoint.orEmpty()

    if (accountingPointId.isEmpty() && controllableUnitId.isEmpty()) {
        raise(BadRequestError("missing business ID for accounting point or controllable unit"))
    }
    if (accountingPointId.isNotEmpty() && controllableUnitId.isNotEmpty()) {
        raise(BadRequestError("request contains business IDs for both accounting point and controllable unit"))
    }

    val gsrn = if (accountingPointId.isNotEmpty()) {
        GSRN.parse(accountingPointId)
            .mapLeft { BadRequestError("ill formed accounting point business ID") }
            .bind()
    } else {
        null
    }

    ValidatedRequest(
        endUser = endUser,
        controllableUnitBusinessId = controllableUnitId,
        accountingPointBusinessId = gsrn
    )
}

private data class ValidatedRequest(
    val endUser: String,
    val controllableUnitBusinessId: String,
    val accountingPointBusinessId: GSRN?,
)
