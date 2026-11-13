package no.elhub.flex.auth.assume

import arrow.core.raise.Raise
import arrow.core.raise.either
import arrow.core.raise.ensure
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.Parameters
import io.ktor.http.parseUrlEncodedParameters
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.contentType
import io.ktor.server.request.receiveChannel
import io.ktor.utils.io.readRemaining
import kotlinx.io.readByteArray
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.db.AuthRepository
import no.elhub.flex.auth.model.dto.generated.models.FlexRole
import no.elhub.flex.auth.model.dto.generated.models.SessionResponse
import no.elhub.flex.auth.plugin.SESSION_COOKIE_NAME
import no.elhub.flex.auth.plugin.callerToken
import no.elhub.flex.auth.plugin.ensureCallerScope
import no.elhub.flex.auth.scope.DefaultEntityScopes
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.scope.intersection
import no.elhub.flex.auth.session.setSessionCookie
import no.elhub.flex.auth.token.AccessToken
import no.elhub.flex.auth.token.toFlexPrincipal
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.http.AppError
import no.elhub.flex.shared.http.OAuthError
import no.elhub.flex.shared.http.respondJson
import org.koin.core.annotation.Single

private val logger = KotlinLogging.logger {}

private val REQUIRED_SCOPE = Scope(ScopeVerb.Manage, "auth:assume")

private const val MAX_REQUEST_BODY_BYTES = 1024L

/**
 * The URL-encoded form of the request. A form of more than [maxBytes] bytes is read as an empty
 * one. The limit is on the bytes that are read, so it holds without `Content-Length` too
 * (chunked requests).
 */
private suspend fun ApplicationCall.receiveBoundedForm(maxBytes: Long): Parameters {
    // one more byte than the limit tells if the body is too big, without reading all of it
    val body = receiveChannel().readRemaining(maxBytes + 1).readByteArray()
    if (body.size > maxBytes) {
        return Parameters.Empty
    }
    return body.decodeToString().parseUrlEncodedParameters()
}

private const val ENTITY_ROLE = "flex_entity"

/**
 * Assumes a party, as a person in the browser: replaces the session cookie of the entity by one
 * of the party.
 */
@Single
class AssumeHandler(
    private val config: AuthConfig,
    private val repository: AuthRepository,
) {

    suspend fun handle(call: ApplicationCall) =
        either {
            ensureCallerScope(call, callerToken(call, config.jwtSecret), REQUIRED_SCOPE)

            val entityToken = sessionToken(call, config.jwtSecret)

            ensure(call.request.contentType().match(ContentType.Application.FormUrlEncoded)) {
                OAuthError("invalid_request", "invalid content type")
            }

            // a form that is too big is read as an empty one
            val form = call.receiveBoundedForm(MAX_REQUEST_BODY_BYTES)

            val partyIdStr = form["party_id"]?.takeIf { it.isNotEmpty() }
                ?: raise(OAuthError("invalid_request", "party_id is required"))
            val partyId = partyIdStr.toIntOrNull()
                ?: raise(OAuthError("invalid_request", "party_id must be an integer"))

            val entity = entityToken.toFlexPrincipal()

            val identity = with(entity) { repository.entityIdentityOfExternalId(entityToken.externalId) }
                .mapLeft { e ->
                    logger.warn { "could not get entity identity in assume handler: ${e.message}" }
                    serverError("could not get entity identity in assume handler")
                }
                .bind()

            // only persons authenticating in the browser are allowed to assume a party
            // entity_clients should use token exchange
            ensure(identity.clientId == null) {
                OAuthError("invalid_client", "client is not allowed to assume a party")
            }

            val assumedParty = with(entity) { repository.assumeParty(partyId.toLong()) }
                .mapLeft { OAuthError("invalid_target", "cannot assume requested party") }
                .bind()

            val partyToken = AccessToken(
                entityId = assumedParty.entityId.toInt(),
                externalId = assumedParty.externalId,
                partyId = partyId,
                role = assumedParty.role,
                scope = entityToken.scope.intersection(assumedParty.partyScopes()),
                expiryUnixSeconds = entityToken.expiryUnixSeconds,
            )

            // assuming the party is done, so we can read the info as the party
            val info = with(partyToken.toFlexPrincipal()) { repository.currentUserInfo() }
                .mapLeft { e ->
                    logger.warn { "could not get current user info in assume handler: ${e.message}" }
                    serverError("could not get current user info")
                }
                .bind()

            call.setSessionCookie(partyToken.sign(config.jwtSecret), partyToken.expiresIn())

            SessionResponse(
                entityId = partyToken.entityId,
                entityName = info.entityName,
                exp = partyToken.expiryUnixSeconds.toInt(),
                partyId = partyId,
                partyName = info.partyName?.takeIf { it.isNotEmpty() },
                role = flexRole(partyToken.role),
            )
        }.respondJson(call)
}

/**
 * Unassumes a party, as a person in the browser: replaces the session cookie of the party by one
 * of the bare entity.
 */
@Single
class UnassumeHandler(
    private val config: AuthConfig,
    private val repository: AuthRepository,
) {

    suspend fun handle(call: ApplicationCall) =
        either {
            ensureCallerScope(call, callerToken(call, config.jwtSecret), REQUIRED_SCOPE)

            val receivedToken = sessionToken(call, config.jwtSecret)

            ensure(receivedToken.partyId != 0) {
                OAuthError("invalid_request", "session cookie is already a bare entity")
            }

            val principal = receivedToken.toFlexPrincipal()

            val identity = with(principal) {
                repository.entityIdentityOfExternalId(receivedToken.externalId)
            }
                .mapLeft { e ->
                    logger.warn { "could not get entity identity in unassume handler: ${e.message}" }
                    serverError("could not get entity identity")
                }
                .bind()

            // entity clients cannot unassume, they have to log in again
            val isClient = with(FlexPrincipal.anonymous) { repository.isClient(receivedToken.externalId) }
                .mapLeft { e ->
                    logger.warn { "could not check the identity in unassume handler: ${e.message}" }
                    serverError("could not check whether the party can be unassumed")
                }
                .bind()
            ensure(!isClient) {
                OAuthError("invalid_request", "party cannot be unassumed")
            }

            val info = with(principal) { repository.currentUserInfo() }
                .mapLeft { e ->
                    logger.warn { "could not get current user info in unassume handler: ${e.message}" }
                    serverError("could not get current user info")
                }
                .bind()

            // the identity did not log in with an entity client, so it has the default scopes
            val entityToken = AccessToken(
                entityId = receivedToken.entityId,
                externalId = identity.externalId,
                partyId = 0,
                role = ENTITY_ROLE,
                scope = DefaultEntityScopes,
                expiryUnixSeconds = receivedToken.expiryUnixSeconds,
            )

            call.setSessionCookie(entityToken.sign(config.jwtSecret), entityToken.expiresIn())

            SessionResponse(
                entityId = entityToken.entityId,
                entityName = info.entityName,
                exp = entityToken.expiryUnixSeconds.toInt(),
                role = flexRole(entityToken.role),
            )
        }.respondJson(call)
}

/** The token of the session cookie, which is the one that is replaced. */
private fun Raise<AppError>.sessionToken(call: ApplicationCall, secret: String): AccessToken {
    val cookie = call.request.cookies[SESSION_COOKIE_NAME]
        ?: raise(OAuthError("invalid_request", "missing session cookie"))
    return AccessToken.parse(cookie, secret)
        .mapLeft { OAuthError("invalid_request", "invalid session cookie") }
        .bind()
}

private fun Raise<AppError>.flexRole(role: String): FlexRole =
    FlexRole.fromValue(role) ?: run {
        logger.warn { "The role of the token is not a role of the auth API: $role" }
        raise(serverError("invalid role in session"))
    }

private fun serverError(description: String) =
    OAuthError("server_error", description, HttpStatusCode.InternalServerError)
