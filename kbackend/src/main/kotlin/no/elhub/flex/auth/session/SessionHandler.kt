package no.elhub.flex.auth.session

import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.Cookie
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.header
import io.ktor.util.date.GMTDate
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.db.AuthRepository
import no.elhub.flex.auth.model.dto.generated.models.FlexRole
import no.elhub.flex.auth.model.dto.generated.models.SessionResponse
import no.elhub.flex.auth.plugin.BearerChallenge
import no.elhub.flex.auth.plugin.SESSION_COOKIE_NAME
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.scope.covers
import no.elhub.flex.auth.token.AccessToken
import no.elhub.flex.auth.token.toFlexPrincipal
import no.elhub.flex.shared.http.AuthError
import no.elhub.flex.shared.http.cookie
import no.elhub.flex.shared.http.respondJson
import org.koin.core.annotation.Single

private val logger = KotlinLogging.logger {}

private val REQUIRED_SCOPE = Scope(ScopeVerb.Read, "auth:session")

/** Returns the session information of the session cookie if available. */
@Single
class SessionHandler(
    private val config: AuthConfig,
    private val repository: AuthRepository,
) {

    suspend fun handle(call: ApplicationCall) =
        either {
            val sessionCookie = call.cookie(SESSION_COOKIE_NAME).bind()

            // TODO: actually implement an opaque session cookie that is backed by e.g. an unlogged database table
            val token = AccessToken.parse(sessionCookie, config.jwtSecret)
                .mapLeft { e ->
                    call.unsetSessionCookie()
                    AuthError(detail = "invalid session cookie", hint = e.message)
                }
                .bind()

            if (!token.scope.covers(REQUIRED_SCOPE)) {
                call.response.header(HttpHeaders.WWWAuthenticate, BearerChallenge.insufficientScope(REQUIRED_SCOPE))
                raise(AuthError(detail = "insufficient scope", code = HttpStatusCode.Forbidden))
            }

            val role = FlexRole.fromValue(token.role) ?: run {
                logger.warn { "The role of the token is not a role of the auth API: ${token.role}" }
                raise(AuthError(detail = "invalid role in session", code = HttpStatusCode.InternalServerError))
            }

            val info = with(token.toFlexPrincipal()) { repository.currentUserInfo() }
                .mapLeft { e ->
                    logger.warn { "Could not get current user info: ${e.message}" }
                    AuthError(
                        detail = "could not get current user info",
                        code = HttpStatusCode.InternalServerError,
                    )
                }
                .bind()

            SessionResponse(
                entityId = token.entityId,
                entityName = info.entityName,
                exp = token.exp.toInt(),
                partyId = token.partyId.takeIf { it != 0 },
                partyName = info.partyName?.takeIf { it.isNotEmpty() },
                role = role,
            )
        }.respondJson(call)

    private fun ApplicationCall.unsetSessionCookie() {
        response.cookies.append(
            Cookie(
                name = SESSION_COOKIE_NAME,
                value = "not.a.session",
                maxAge = 0,
                expires = GMTDate.START,
                path = "/",
                secure = true,
                httpOnly = true,
                extensions = mapOf("SameSite" to "Strict"),
            ),
        )
    }
}
