package no.elhub.flex.api.routes.entity

import arrow.core.Either
import arrow.core.left
import arrow.core.raise.either
import arrow.core.raise.ensure
import arrow.core.right
import io.ktor.http.HttpStatusCode
import io.ktor.server.routing.RoutingCall
import no.elhub.flex.api.auth.AccessTokenKey
import no.elhub.flex.api.auth.FlexRole
import no.elhub.flex.api.auth.toFlexPrincipal
import no.elhub.flex.api.entity.db.EntityLookupResult
import no.elhub.flex.api.entity.db.EntityRepository
import no.elhub.flex.api.model.dto.generated.models.EntityLookupRequest
import no.elhub.flex.api.model.dto.generated.models.EntityLookupRequestBusinessIdType
import no.elhub.flex.api.model.dto.generated.models.EntityLookupRequestType
import no.elhub.flex.api.model.dto.generated.models.EntityLookupResponse
import no.elhub.flex.api.model.error.AppError
import no.elhub.flex.api.model.error.AuthenticationError
import no.elhub.flex.api.model.error.InternalServerError
import no.elhub.flex.api.model.error.ParsingError
import no.elhub.flex.api.util.TraceIdUtil.Companion.traceIdOrUnknown
import no.elhub.flex.api.util.body
import no.elhub.flex.api.util.handleError
import no.elhub.flex.api.util.respondJson
import org.koin.core.annotation.Single

private const val ORGANISATION_ROLE = "flex_organisation"

private val allowedRoles = setOf(FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR.roleName, ORGANISATION_ROLE)
private val organisationNumber = Regex("^[1-9][0-9]{8}$")
private val emailAddress = Regex("^[^@\\s<>]+@[^@\\s<>]+$")

/** Finds an entity from its business ID, creating it if missing. Created entities give HTTP 201. */
@Single(createdAtStart = true)
class EntityLookup(private val repo: EntityRepository) {

    suspend fun handle(call: RoutingCall) {
        val token = call.attributes[AccessTokenKey]

        either<AppError, EntityLookupResult> {
            ensure(token.role in allowedRoles) { AuthenticationError("user cannot perform this operation") }

            val request = call.body<EntityLookupRequest>().bind()
            validate(request).bind()

            with(token.toFlexPrincipal()) {
                repo.lookup(
                    businessId = request.businessId,
                    name = request.name,
                    type = request.type.value,
                    businessIdType = request.businessIdType.value,
                ).mapLeft { InternalServerError(traceIdOrUnknown()) }.bind()
            }
        }.fold(
            ifLeft = { error -> handleError(call, error) },
            ifRight = { result ->
                val status = if (result.found) HttpStatusCode.OK else HttpStatusCode.Created
                EntityLookupResponse(entityId = result.entityId).right().respondJson(call, status)
            },
        )
    }

    private fun validate(request: EntityLookupRequest): Either<AppError, Unit> {
        val problems = buildList {
            val expectedType = when (request.businessIdType) {
                EntityLookupRequestBusinessIdType.EMAIL -> EntityLookupRequestType.PERSON
                EntityLookupRequestBusinessIdType.ORG -> EntityLookupRequestType.ORGANISATION
            }
            if (request.type != expectedType) {
                add("business_id_type '${request.businessIdType}' is not valid for entity type '${request.type}'")
            }

            when (request.businessIdType) {
                EntityLookupRequestBusinessIdType.EMAIL -> {
                    if (!emailAddress.matches(request.businessId)) add("email address is not valid")
                    if (request.businessId != request.businessId.lowercase()) add("email address must be lowercase")
                }

                EntityLookupRequestBusinessIdType.ORG ->
                    if (!organisationNumber.matches(request.businessId)) add("organisation number must be 9 digits long")
            }

            if (request.name.isEmpty()) add("missing entity name")
        }

        return if (problems.isEmpty()) Unit.right() else ParsingError(problems.joinToString(", ")).left()
    }
}
