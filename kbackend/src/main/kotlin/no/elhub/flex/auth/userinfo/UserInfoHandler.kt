package no.elhub.flex.auth.userinfo

import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.server.application.ApplicationCall
import no.elhub.flex.auth.db.AuthRepository
import no.elhub.flex.auth.model.dto.generated.models.FlexRole
import no.elhub.flex.auth.model.dto.generated.models.UserinfoResponse
import no.elhub.flex.auth.plugin.accessToken
import no.elhub.flex.auth.token.toFlexPrincipal
import no.elhub.flex.shared.http.AppError
import no.elhub.flex.shared.http.InternalServerError
import no.elhub.flex.shared.http.respondJson
import no.elhub.flex.shared.tracing.TraceIdUtil.Companion.traceIdOrUnknown
import org.koin.core.annotation.Single

private val logger = KotlinLogging.logger {}

/** Handles `GET /auth/v1/userinfo`: returns the identity information of the current user. */
@Single
class UserInfoHandler(private val repository: AuthRepository) {

    suspend fun handle(call: ApplicationCall) =
        either {
            val token = call.accessToken

            val role = FlexRole.fromValue(token.role) ?: run {
                logger.warn { "The role of the token is not a role of the auth API: ${token.role}" }
                raise(InternalServerError(traceIdOrUnknown()))
            }

            val info = with(token.toFlexPrincipal()) { repository.currentUserInfo() }
                .mapLeft { e ->
                    logger.error { "Could not get current user info: ${e.message}" }
                    InternalServerError(traceIdOrUnknown())
                }
                .bind()

            UserinfoResponse(
                sub = info.externalId,
                entityId = info.entityId,
                entityName = info.entityName,
                partyId = info.partyId,
                partyName = info.partyName,
                currentRole = role,
            )
        }.respondJson(call)
}
