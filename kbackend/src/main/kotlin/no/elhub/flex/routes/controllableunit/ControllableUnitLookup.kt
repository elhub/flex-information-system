package no.elhub.flex.routes.controllableunit

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
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
import no.elhub.flex.util.body
import no.elhub.flex.util.logger
import no.elhub.flex.util.respondJson
import org.koin.core.annotation.Property
import org.koin.core.annotation.Single
import kotlin.time.Instant

private val END_USER_REGEX = Regex("^[1-9]([0-9]{8}|[0-9]{10})$")
private val CONTROLLABLE_UNIT_BUSINESS_ID_REGEX =
    Regex("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")

@Single(createdAtStart = true)
class ControllableUnitLookup(
    private val repo: ControllableUnitRepository,
    private val accountingPointService: AccountingPointService,
    @Property("accounting-point-adapter.sync-enabled") private val accountingPointAdapterSyncEnabled: Boolean = true,
) {
    private val logger = KotlinLogging.logger {}

    suspend fun handle(call: RoutingCall) {
        with(FlexPrincipal.internalData()) {
            either {
                val request = call.body<ControllableUnitLookupRequest>().bind()
                    .let { validateInput(it).bind() }

                val accountingPointBusinessId = request.accountingPointBusinessId?.value
                    ?: accountingPointService.getCurrentAccountingPoint(request.controllableUnitBusinessId).bind().businessId

                logger.debug { "Controllable unit used in lookup: ${request.controllableUnitBusinessId}" }
                logger.debug { "Accounting point used in lookup: $accountingPointBusinessId" }

                // TODO: fix role
                // The underlying query does not call a security definer function. It is a direct query against CU/AP,
                // so it cannot be called with user role, we need to either rewrite this as a DB function or switch to a
                // system role for this handler (flex_internal_data).
                val controllableUnits = fetchControllableUnits(
                    request.controllableUnitBusinessId,
                    accountingPointBusinessId
                ).bind()
                logger.debug { "Found ${controllableUnits.size} controllable units on accounting point $accountingPointBusinessId" }

                val validFrom = controllableUnits.mapNotNull { it.startDate }.minByOrNull { it }?.asLocalStartOfDayInstant()
                    ?: Instant.atLocalStartOfToday()
                logger.debug { "Using $validFrom as start date for accounting point sync" }

                if (accountingPointAdapterSyncEnabled) {
                    accountingPointService.synchronizeAccountingPoint(accountingPointBusinessId, validFrom).bind()
                } else {
                    logger.info { "Accounting point sync disabled, not calling adapter." }
                }

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

    context(principal: FlexPrincipal)
    private suspend fun fetchControllableUnits(
        controllableUnitBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<AppError, List<ControllableUnit>> =
        repo.lookupControllableUnits(controllableUnitBusinessId, accountingPointBusinessId)
            .mapLeft { e ->
                logger.error { "Failed to lookup controllable units: ${e.message}" }
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
