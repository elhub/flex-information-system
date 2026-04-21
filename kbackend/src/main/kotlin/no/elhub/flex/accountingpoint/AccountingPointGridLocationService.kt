package no.elhub.flex.accountingpoint

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.accountingpoint.db.AccountingPointGridLocationRepository
import no.elhub.flex.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.auth.FlexRole
import no.elhub.flex.model.domain.AccountingPointGridLocation
import no.elhub.flex.model.domain.GridLocationObjectType
import no.elhub.flex.model.domain.GridLocationQuality
import no.elhub.flex.model.domain.GridLocationSource
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.model.dto.generated.models.AccountingPointGridLocationCreateRequest
import no.elhub.flex.model.dto.generated.models.AccountingPointGridLocationCreateRequestQuality
import no.elhub.flex.model.dto.generated.models.AccountingPointGridLocationUpdateRequest
import no.elhub.flex.model.dto.generated.models.AccountingPointGridLocationUpdateRequestQuality
import no.elhub.flex.model.error.AppError
import no.elhub.flex.model.error.ConflictError
import no.elhub.flex.model.error.ForbiddenError
import no.elhub.flex.model.error.InternalServerError
import no.elhub.flex.model.error.ResourceNotFoundError
import no.elhub.flex.util.TraceIdUtil.Companion.traceIdOrUnknown
import org.koin.core.annotation.Single

interface AccountingPointGridLocationService {
    /**
     * Returns the grid location for the given accounting point.
     * Returns [ResourceNotFoundError] if no grid location exists.
     */
    context(principal: FlexPrincipal)
    suspend fun getByAccountingPointId(accountingPointId: Long): Either<AppError, AccountingPointGridLocation>

    /**
     * Creates a grid location for the given accounting point.
     * Returns [ConflictError] if a grid location already exists.
     * Returns [ForbiddenError] if the caller is not CSO or PSO for the accounting point.
     */
    context(principal: FlexPrincipal)
    suspend fun create(
        accountingPointId: Long,
        request: AccountingPointGridLocationCreateRequest,
    ): Either<AppError, AccountingPointGridLocation>

    /**
     * Updates the grid location for the given accounting point.
     * Returns [ResourceNotFoundError] if no grid location exists.
     * Returns [ForbiddenError] if the caller is not CSO or PSO for the accounting point.
     */
    context(principal: FlexPrincipal)
    suspend fun update(
        accountingPointId: Long,
        request: AccountingPointGridLocationUpdateRequest,
    ): Either<AppError, AccountingPointGridLocation>
}

@Single(createdAtStart = true)
class AccountingPointGridLocationServiceImpl(
    private val repository: AccountingPointGridLocationRepository,
    private val accountingPointRepository: AccountingPointRepository,
) : AccountingPointGridLocationService {

    companion object {
        private val logger = KotlinLogging.logger {}
    }

    context(principal: FlexPrincipal)
    override suspend fun getByAccountingPointId(
        accountingPointId: Long,
    ): Either<AppError, AccountingPointGridLocation> = either {
        repository.getByAccountingPointId(accountingPointId)
            .mapLeft { it.toInternalServerError("getByAccountingPointId") }.bind()
            ?: raise(ResourceNotFoundError("accounting point $accountingPointId does not have a grid location"))
    }

    context(principal: FlexPrincipal)
    override suspend fun create(
        accountingPointId: Long,
        request: AccountingPointGridLocationCreateRequest,
    ): Either<AppError, AccountingPointGridLocation> = either {
        val existing = repository.getByAccountingPointId(accountingPointId)
            .mapLeft { it.toInternalServerError("getByAccountingPointId") }.bind()

        if (existing != null) {
            raise(ConflictError("accounting point $accountingPointId already has a grid location"))
        }

        val source = deriveSource(accountingPointId).bind()
        val quality = request.quality.toDomain()

        val gridLocation = AccountingPointGridLocation(
            id = 0,
            accountingPointId = accountingPointId,
            objectType = GridLocationObjectType.fromString(request.objectType.value),
            businessId = request.businessId,
            name = request.name,
            nominalVoltage = request.nominalVoltage,
            additionalInformation = request.additionalInformation,
            source = source,
            quality = quality,
            recordedAt = null,
            recordedBy = null,
        )

        repository.insert(gridLocation)
            .mapLeft { it.toInternalServerError("insert") }.bind()
    }

    context(principal: FlexPrincipal)
    override suspend fun update(
        accountingPointId: Long,
        request: AccountingPointGridLocationUpdateRequest,
    ): Either<AppError, AccountingPointGridLocation> = either {
        val existing = repository.getByAccountingPointId(accountingPointId)
            .mapLeft { it.toInternalServerError("getByAccountingPointId") }.bind()
            ?: raise(ResourceNotFoundError("accounting point $accountingPointId does not have a grid location"))

        val source = deriveSource(accountingPointId).bind()
        val quality = request.quality.toDomain()

        val updated = existing.copy(
            objectType = request.objectType?.let { GridLocationObjectType.fromString(it.value) }
                ?: existing.objectType,
            businessId = request.businessId ?: existing.businessId,
            name = request.name ?: existing.name,
            nominalVoltage = request.nominalVoltage ?: existing.nominalVoltage,
            additionalInformation = request.additionalInformation ?: existing.additionalInformation,
            source = source,
            quality = quality,
        )

        repository.update(updated)
            .mapLeft { error ->
                when (error) {
                    is NotFoundError -> ResourceNotFoundError("accounting point $accountingPointId does not have a grid location")
                    else -> error.toInternalServerError("update")
                }
            }.bind()
    }

    context(principal: FlexPrincipal)
    private suspend fun deriveSource(
        accountingPointId: Long,
    ): Either<AppError, GridLocationSource> = either {
        if (principal.role == FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR.roleName) {
            return@either GridLocationSource.SO
        }
        when {
            accountingPointRepository.isConnectingSystemOperator(accountingPointId)
                .mapLeft { it.toInternalServerError("isConnectingSystemOperator") }.bind() ->
                GridLocationSource.CSO

            accountingPointRepository.isProcuringSystemOperator(accountingPointId)
                .mapLeft { it.toInternalServerError("isProcuringSystemOperator") }.bind() ->
                GridLocationSource.SO

            else -> raise(ForbiddenError("caller is not CSO or PSO for accounting point $accountingPointId"))
        }
    }

    private fun RepositoryError.toInternalServerError(context: String): AppError {
        logger.error { "$context failed: $this" }
        return InternalServerError(traceIdOrUnknown())
    }
}

private fun AccountingPointGridLocationCreateRequestQuality.toDomain(): GridLocationQuality =
    GridLocationQuality.fromString(this.value)

private fun AccountingPointGridLocationUpdateRequestQuality.toDomain(): GridLocationQuality =
    GridLocationQuality.fromString(this.value)
