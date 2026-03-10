package no.elhub.flex.controllableunit.lookup

import arrow.core.Either
import arrow.core.left
import arrow.core.raise.either
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.RoutingCall
import no.elhub.flex.auth.AccessToken
import no.elhub.flex.auth.AccessTokenKey
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.controllableunit.dto.AccountingPointSummary
import no.elhub.flex.controllableunit.dto.ControllableUnit
import no.elhub.flex.controllableunit.dto.ControllableUnitLookupRequest
import no.elhub.flex.controllableunit.dto.ControllableUnitLookupResponse
import no.elhub.flex.controllableunit.dto.EndUserSummary
import no.elhub.flex.controllableunit.dto.ErrorMessage
import no.elhub.flex.domain.AccountingPoint
import no.elhub.flex.flexprivate.FlexPrivateService
import no.elhub.flex.util.isValidGsrn

private val logger = KotlinLogging.logger {}

private val ALLOWED_ROLES = setOf(
    "flex_service_provider",
    "flex_flexibility_information_system_operator",
)

private val END_USER_REGEX = Regex("^[1-9]([0-9]{8}|[0-9]{10})$")
private val CONTROLLABLE_UNIT_BUSINESS_ID_REGEX =
    Regex("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")

private typealias HttpError = Pair<HttpStatusCode, ErrorMessage>

/**
 * Handles `POST /controllable_unit/lookup`.
 *
 * 1. Check role
 * 2. Parse + validate body
 * 3. Repository calls each open their own transaction with the RLS preamble applied via the
 *    [AccessToken] context parameter; FlexPrivate is called lazily only when an AP is not found
 *    in the local DB
 * 4. Build and return the response
 *
 * @param repo repository for controllable-unit database queries
 * @param flexPrivate external service for metering grid area lookups
 */
class ControllableUnitLookup(
    private val repo: ControllableUnitRepository,
    private val flexPrivate: FlexPrivateService,
) {
    suspend fun handle(call: RoutingCall) {
        val token = call.attributes[AccessTokenKey]

        val result: Either<HttpError, ControllableUnitLookupResponse> = either {
            val validatedRequest = checkRole(token)
                .bind()
                .let { parseBody(call).bind() }
                .let { validateInput(it).mapLeft { e -> Pair(HttpStatusCode.BadRequest, e) }.bind() }

            with(token) {
                val accountingPoint = resolveAccountingPoint(validatedRequest).bind()
                val endUserId = verifyEndUserMatchesAccountingPoint(validatedRequest.endUser, accountingPoint.businessId).bind()
                val controllableUnits = fetchControllableUnits(validatedRequest.controllableUnitBusinessId, accountingPoint.businessId).bind()

                ControllableUnitLookupResponse(
                    accountingPoint = AccountingPointSummary(id = accountingPoint.id, businessId = accountingPoint.businessId),
                    endUser = EndUserSummary(id = endUserId),
                    controllableUnits = controllableUnits,
                )
            }
        }

        when (result) {
            is Either.Right -> call.respond(HttpStatusCode.OK, result.value)

            is Either.Left -> {
                val (status, errorMsg) = result.value
                call.respond(status, errorMsg)
            }
        }
    }

    private fun checkRole(token: AccessToken): Either<HttpError, Unit> =
        if (token.role in ALLOWED_ROLES) {
            Unit.right()
        } else {
            Pair(HttpStatusCode.Unauthorized, ErrorMessage(code = "HTTP401", message = "user cannot perform this operation"))
                .left()
        }

    private suspend fun parseBody(call: RoutingCall): Either<HttpError, ControllableUnitLookupRequest> =
        runCatching { call.receive<ControllableUnitLookupRequest>() }.fold(
            onSuccess = { it.right() },
            onFailure = { e ->
                logger.debug { "Could not parse CU lookup request body: ${e.message}" }
                Pair(HttpStatusCode.BadRequest, ErrorMessage(code = "HTTP400", message = "ill formed request body")).left()
            },
        )

    private suspend fun fetchAccountingPointMeteringGridArea(accountingPointBusinessId: String): Either<HttpError, String> =
        flexPrivate.fetchMeteringGridArea(accountingPointBusinessId).mapLeft { err ->
            logger.debug { "Accounting point not in datahub: $accountingPointBusinessId ($err)" }
            Pair(HttpStatusCode.NotFound, ErrorMessage(code = "HTTP404", message = "accounting point does not exist"))
        }

    /**
     * Resolves the Accounting Point from either the CU path or the AP path.
     *
     * - **CU path**: looks up the current accounting point for the given CU business ID.
     * - **AP path**: fetches the AP from the database; if absent, sync with FlexPrivate — a [Left] from FlexPrivate → 404.
     */
    context(token: AccessToken)
    private suspend fun resolveAccountingPoint(
        validated: ValidatedRequest,
    ): Either<HttpError, AccountingPoint> = either {
        if (validated.controllableUnitBusinessId.isNotEmpty()) {
            repo.getCurrentAccountingPoint(validated.controllableUnitBusinessId)
                .mapLeft { err ->
                    logger.info { "Controllable unit does not exist: ${validated.controllableUnitBusinessId}" }
                    Pair(HttpStatusCode.NotFound, ErrorMessage(code = "HTTP404", message = err.message))
                }
                .bind()
        } else {
            val accountingPointBusinessId = validated.accountingPointBusinessId
            val localAccountingPointId = repo.getAccountingPointIdByBusinessId(accountingPointBusinessId)

            if (localAccountingPointId.isRight()) {
                AccountingPoint(id = (localAccountingPointId as Either.Right).value, businessId = accountingPointBusinessId)
            } else {
                val meteringGridAreaBusinessId = fetchAccountingPointMeteringGridArea(accountingPointBusinessId).bind()
                val accountingPointId = repo.upsertAccountingPointMeteringGridArea(accountingPointBusinessId, meteringGridAreaBusinessId, validated.endUser)
                    .mapLeft { err ->
                        logger.error { "Failed to sync accounting point: ${err.message}" }
                        Pair(HttpStatusCode.InternalServerError, ErrorMessage(code = "HTTP500", message = "Try again later"))
                    }
                    .bind()
                AccountingPoint(id = accountingPointId, businessId = accountingPointBusinessId)
            }
        }
    }

    context(token: AccessToken)
    private fun verifyEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<HttpError, Int> =
        repo.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
            .mapLeft {
                Pair(
                    HttpStatusCode.Forbidden,
                    ErrorMessage(code = "HTTP403", message = "end user does not match accounting point / controllable unit"),
                )
            }

    context(token: AccessToken)
    private fun fetchControllableUnits(
        controllableUnitBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<HttpError, List<ControllableUnit>> =
        repo.lookupControllableUnits(controllableUnitBusinessId, accountingPointBusinessId)
            .mapLeft { err ->
                logger.error { "CU lookup query failed: ${err.message}" }
                Pair(HttpStatusCode.InternalServerError, ErrorMessage(code = "HTTP500", message = "Try again later"))
            }
}

/** Validates the request body and returns a sanitised copy or an [ErrorMessage]. */
private fun validateInput(req: ControllableUnitLookupRequest): Either<ErrorMessage, ValidatedRequest> {
    val endUser = req.endUser.orEmpty()

    if (endUser.isEmpty()) {
        return ErrorMessage(code = "HTTP400", message = "missing end user business ID").left()
    }
    if (!END_USER_REGEX.matches(endUser)) {
        return ErrorMessage(code = "HTTP400", message = "ill formed end user business ID").left()
    }

    val controllableUnitId = req.controllableUnit.orEmpty()
    if (controllableUnitId.isNotEmpty() && !CONTROLLABLE_UNIT_BUSINESS_ID_REGEX.matches(controllableUnitId)) {
        return ErrorMessage(code = "HTTP400", message = "ill formed controllable unit business ID").left()
    }

    val accountingPointId = req.accountingPoint.orEmpty()

    if (accountingPointId.isEmpty() && controllableUnitId.isEmpty()) {
        return ErrorMessage(
            code = "HTTP400",
            message = "missing business ID for accounting point or controllable unit",
        ).left()
    }
    if (accountingPointId.isNotEmpty() && controllableUnitId.isNotEmpty()) {
        return ErrorMessage(
            code = "HTTP400",
            message = "request contains business IDs for both accounting point and controllable unit",
        ).left()
    }
    if (accountingPointId.isNotEmpty() && !isValidGsrn(accountingPointId)) {
        return ErrorMessage(code = "HTTP400", message = "ill formed accounting point business ID").left()
    }

    return ValidatedRequest(endUser = endUser, controllableUnitBusinessId = controllableUnitId, accountingPointBusinessId = accountingPointId).right()
}

private data class ValidatedRequest(
    val endUser: String,
    val controllableUnitBusinessId: String,
    val accountingPointBusinessId: String,
)
