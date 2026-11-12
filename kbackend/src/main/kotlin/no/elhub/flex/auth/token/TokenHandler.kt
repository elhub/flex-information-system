package no.elhub.flex.auth.token

import arrow.core.Either
import arrow.core.getOrElse
import arrow.core.raise.Raise
import arrow.core.raise.either
import arrow.core.raise.ensure
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.Parameters
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.receiveParameters
import io.ktor.server.response.header
import no.elhub.flex.api.config.FlexConfig
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.db.AuthRepository
import no.elhub.flex.auth.model.AssumedParty
import no.elhub.flex.auth.model.dto.generated.models.JwtBearerRequestGrantType
import no.elhub.flex.auth.model.dto.generated.models.TokenExchangeRequestActorTokenType
import no.elhub.flex.auth.model.dto.generated.models.TokenExchangeRequestGrantType
import no.elhub.flex.auth.model.dto.generated.models.TokenResponse
import no.elhub.flex.auth.model.dto.generated.models.TokenResponseIssuedTokenType
import no.elhub.flex.auth.model.dto.generated.models.TokenResponseTokenType
import no.elhub.flex.auth.plugin.AnonymousScopes
import no.elhub.flex.auth.plugin.BearerChallenge
import no.elhub.flex.auth.plugin.SESSION_COOKIE_NAME
import no.elhub.flex.auth.scope.DefaultOwnedPartyScopes
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.scope.covers
import no.elhub.flex.auth.scope.intersection
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.http.AppError
import no.elhub.flex.shared.http.AuthError
import no.elhub.flex.shared.http.OAuthError
import no.elhub.flex.shared.http.respondJson
import org.koin.core.annotation.Single
import java.security.KeyFactory
import java.security.interfaces.RSAPublicKey
import java.security.spec.X509EncodedKeySpec
import java.util.Base64

private val logger = KotlinLogging.logger {}

private val REQUIRED_SCOPE = Scope(ScopeVerb.Use, "auth:token")

private const val MILLIS_PER_SECOND = 1000L
private const val BEARER_PREFIX = "Bearer "
private const val ASSUME_PARTY_SCOPE_PREFIX = "assume:party:"
private const val ENTITY_ROLE = "flex_entity"
private const val JWT_PARTS = 3

/** Handles the token exchange and the JWT bearer calls. */
@Single
class TokenHandler(
    private val config: AuthConfig,
    flexConfig: FlexConfig,
    private val repository: AuthRepository,
) {
    /** The auth API itself: the expected audience of the authorization grants. */
    private val self = flexConfig.baseUrl.trimEnd('/') + "/auth/v1/"

    suspend fun handle(call: ApplicationCall) {
        either {
            // The authentication plugin is not used: it answers 401 to an invalid token, where this endpoint answers
            // 400 as the OAuth token endpoints do, so the handler reads the token of the caller itself.
            val caller = callerToken(call)

            if (!(caller?.scope ?: AnonymousScopes).covers(REQUIRED_SCOPE)) {
                call.response.header(HttpHeaders.WWWAuthenticate, BearerChallenge.insufficientScope(REQUIRED_SCOPE))
                raise(AuthError("insufficient scope", code = HttpStatusCode.Forbidden))
            }

            // like a form binding, a body that is not a form is the same as an empty form
            val form = Either.catch { call.receiveParameters() }.getOrElse { Parameters.Empty }

            val grantType = form["grant_type"]?.takeIf { it.isNotEmpty() }
                ?: raise(OAuthError("invalid_request", "no grant_type in request"))

            when (grantType) {
                TokenExchangeRequestGrantType.URN_IETF_PARAMS_OAUTH_GRANT_TYPE_TOKEN_EXCHANGE.value ->
                    tokenExchange(call, form)

                JwtBearerRequestGrantType.URN_IETF_PARAMS_OAUTH_GRANT_TYPE_JWT_BEARER.value ->
                    jwtBearer(caller, form)

                else -> raise(OAuthError("unsupported_grant_type", "unsupported grant type: $grantType"))
            }
        }.respondJson(call)
    }

    private suspend fun Raise<AppError>.tokenExchange(call: ApplicationCall, form: Parameters): TokenResponse {
        val actorToken = requiredField(form, "actor_token", "bad token exchange request")
        val actorTokenType = requiredField(form, "actor_token_type", "bad token exchange request")
        val scope = requiredField(form, "scope", "bad token exchange request")

        ensure(actorTokenType == TokenExchangeRequestActorTokenType.URN_IETF_PARAMS_OAUTH_TOKEN_TYPE_JWT.value) {
            OAuthError("invalid_request", "invalid actor_token_type")
        }

        val headerToken = call.request.headers[HttpHeaders.Authorization].orEmpty().removePrefix(BEARER_PREFIX)
        ensure(headerToken == actorToken) {
            OAuthError("invalid_request", "actor token must match header token")
        }

        val entityToken = AccessToken.parse(actorToken, config.jwtSecret)
            .mapLeft { OAuthError("invalid_request", "Invalid actor token") }
            .bind()

        val assumePartyId = scopeToPartyId(scope)
            ?: raise(OAuthError("invalid_scope", "invalid scope format"))

        val principal = entityToken.toFlexPrincipal()

        val identity = with(principal) { repository.entityIdentityOfExternalId(entityToken.externalId) }
            .mapLeft { e ->
                AuthError(
                    "could not get entity identity in token exchange handler",
                    e.message,
                    HttpStatusCode.InternalServerError,
                )
            }
            .bind()

        identity.clientId?.let { clientId ->
            val entityClient = with(principal) { repository.entityClientByClientId(clientId) }
                .mapLeft { e ->
                    AuthError(
                        "could not get entity client in token exchange handler",
                        e.message,
                        HttpStatusCode.InternalServerError,
                    )
                }
                .bind()

            // a client restricted to a specific party can only assume that party
            ensure(entityClient.partyId == null || entityClient.partyId == assumePartyId.toLong()) {
                OAuthError("invalid_client", "client is not allowed to assume the requested party")
            }
        }

        val assumedParty = with(principal) { repository.assumeParty(assumePartyId.toLong()) }
            .mapLeft { OAuthError("invalid_target", "entity cannot assume requested party") }
            .bind()

        val partyToken = AccessToken(
            entityId = assumedParty.entityId.toInt(),
            externalId = assumedParty.externalId,
            partyId = assumePartyId,
            role = assumedParty.role,
            scope = entityToken.scope.intersection(assumedParty.partyScopes()),
            expiryUnixSeconds = entityToken.expiryUnixSeconds,
        )

        logger.info {
            "successful token exchange login: entity ${assumedParty.entityId}, party $assumePartyId, eid ${assumedParty.externalId}"
        }

        return partyToken.toTokenResponse()
    }

    private suspend fun Raise<AppError>.jwtBearer(caller: AccessToken?, form: Parameters): TokenResponse {
        val assertion = requiredField(form, "assertion", "bad jwt bearer request")

        // only callers without token, i.e. anonymous ones, can authenticate with a grant
        ensure(caller == null) {
            OAuthError("invalid_client", "client is not anonymous", HttpStatusCode.Unauthorized)
        }

        // Before being able to verify the token we need to know the entity of the client
        // so that we can fetch their public key to verify the token.
        // This means unpacking the token payload.

        val jwtParts = assertion.split(".")
        ensure(jwtParts.size == JWT_PARTS) {
            OAuthError("invalid_request", "assertion is not signed jwt in compact form")
        }

        val jwtPayload = Either.catch { Base64.getUrlDecoder().decode(jwtParts[1]) }
            .mapLeft { OAuthError("invalid_request", "invalid base64 encoding in assertion payload") }
            .bind()

        val grant = AuthorizationGrant.parse(jwtPayload.decodeToString())
            .mapLeft { OAuthError("invalid_request", it.message) }
            .bind()

        ensure(grant.audience == self) {
            OAuthError("invalid_request", "assertion audience is not $self")
        }

        // get entity of client
        val entityClient = with(FlexPrincipal.anonymous) { repository.entityClientByClientId(grant.issuer) }
            .mapLeft { OAuthError("invalid_client", "invalid or unknown client") }
            .bind()
        val publicKeyPem = entityClient.publicKey?.takeIf { it.isNotEmpty() }
            ?: raise(OAuthError("invalid_client", "invalid or unknown client"))

        val publicKey = parsePublicKey(publicKeyPem)
            .mapLeft { e ->
                AuthError("invalid public key stored for client", e.message, HttpStatusCode.InternalServerError)
            }
            .bind()

        verifySignature(assertion, publicKey)
            .mapLeft { e ->
                OAuthError("invalid_request", "could not verify assertion: key or payload is invalid: ${e.message}")
            }
            .bind()

        val subject = grant.subject
        val token =
            if (subject != null) {
                // entity wants to assume a party
                // we must first "log in" the entity to give it privileges in the database
                // so we can properly run the queries below
                val entity = FlexPrincipal(role = ENTITY_ROLE, eid = entityClient.externalId)

                val partyId = with(entity) {
                    repository.assumablePartyId(entityClient.entityId, subject.identifier, subject.partyType)
                }
                    .mapLeft { e ->
                        logger.error { "getting assumable party ID failed: ${e.message}" }
                        OAuthError("invalid_client", "could not assume the requested party in sub")
                    }
                    .bind()

                // a client restricted to a specific party can only assume that party
                ensure(entityClient.partyId == null || entityClient.partyId == partyId) {
                    OAuthError("invalid_client", "client is not allowed to assume the requested party")
                }

                val assumedParty = with(entity) { repository.assumeParty(partyId) }
                    .mapLeft { OAuthError("invalid_target", "entity cannot assume requested party") }
                    .bind()

                logger.info {
                    "successful JWT bearer login: entity ${assumedParty.entityId}, party $partyId, eid ${entityClient.externalId}"
                }

                AccessToken(
                    entityId = assumedParty.entityId.toInt(),
                    externalId = assumedParty.externalId,
                    partyId = partyId.toInt(),
                    role = assumedParty.role,
                    scope = entityClient.scopes.intersection(assumedParty.partyScopes()),
                    expiryUnixSeconds = newExpiryUnixSeconds(),
                )
            } else {
                logger.info {
                    "successful JWT bearer login: entity ${entityClient.entityId}, party null, eid ${entityClient.externalId}"
                }

                AccessToken(
                    entityId = entityClient.entityId.toInt(),
                    externalId = entityClient.externalId,
                    partyId = 0,
                    role = ENTITY_ROLE,
                    scope = entityClient.scopes,
                    expiryUnixSeconds = newExpiryUnixSeconds(),
                )
            }

        return token.toTokenResponse()
    }

    /**
     * The token of the caller: the one of the `Authorization: Bearer` header, which takes precedence, or of the
     * session cookie. `null` for an anonymous caller. Raises HTTP 400 if the token is not valid.
     *
     * Necessary because the errors in this OAuth 2 flow must be reported in a specific way,
     * different from endpoints with the auth plugin.
     */
    private fun Raise<AppError>.callerToken(call: ApplicationCall): AccessToken? {
        val authHeader = call.request.headers[HttpHeaders.Authorization]?.takeIf { it.isNotEmpty() }
        val jwt =
            if (authHeader != null) {
                if (!authHeader.startsWith(BEARER_PREFIX)) {
                    val description = "missing Bearer in Authorization header"
                    call.response.header(HttpHeaders.WWWAuthenticate, BearerChallenge.invalidRequest(description))
                    raise(OAuthError("invalid_request", description))
                }
                authHeader.removePrefix(BEARER_PREFIX)
            } else {
                call.request.cookies[SESSION_COOKIE_NAME]
            } ?: return null

        return AccessToken.parse(jwt, config.jwtSecret).getOrElse {
            call.response.header(HttpHeaders.WWWAuthenticate, BearerChallenge.invalidToken("invalid bearer token"))
            raise(OAuthError("invalid_request", "unable to verify and validate token"))
        }
    }

    private fun AccessToken.toTokenResponse() =
        TokenResponse(
            accessToken = sign(config.jwtSecret),
            issuedTokenType = TokenResponseIssuedTokenType.URN_IETF_PARAMS_OAUTH_TOKEN_TYPE_ACCESS_TOKEN,
            tokenType = TokenResponseTokenType.BEARER,
            expiresIn = (expiryUnixSeconds - nowUnixSeconds()).toInt(),
        )
}

/** The scopes of the party: those of the membership, or the default ones when the entity owns the party. */
private fun AssumedParty.partyScopes(): List<Scope> = scopes ?: DefaultOwnedPartyScopes

private fun nowUnixSeconds(): Long = System.currentTimeMillis() / MILLIS_PER_SECOND

private fun newExpiryUnixSeconds(): Long = nowUnixSeconds() + AccessToken.DURATION_SECONDS

/** Returns the ID of the party in a scope like `assume:party:123`, or `null` if the scope has another format. */
private fun scopeToPartyId(scope: String): Int? =
    scope.removePrefix(ASSUME_PARTY_SCOPE_PREFIX).takeIf { it != scope }?.toIntOrNull()

/** Returns the value of the form field [name], or raises a bad request if it is missing or empty. */
private fun Raise<AppError>.requiredField(form: Parameters, name: String, description: String): String =
    form[name]?.takeIf { it.isNotEmpty() } ?: raise(OAuthError("invalid_request", "$description: $name is required"))

private fun parsePublicKey(pem: String): Either<Throwable, RSAPublicKey> =
    Either.catch {
        val base64 = pem.removePrefix("-----BEGIN PUBLIC KEY-----").removeSuffix("-----END PUBLIC KEY-----")
        val der = Base64.getMimeDecoder().decode(base64)
        KeyFactory.getInstance("RSA").generatePublic(X509EncodedKeySpec(der)) as RSAPublicKey
    }

/** Verifies the RS256 signature of the JWT, and nothing else: its claims are checked separately. */
private fun verifySignature(jwt: String, publicKey: RSAPublicKey): Either<Throwable, Unit> =
    Either.catch {
        val decoded = JWT.decode(jwt)
        require(decoded.algorithm == "RS256") { "unexpected algorithm ${decoded.algorithm}" }
        Algorithm.RSA256(publicKey, null).verify(decoded)
    }
