package no.elhub.flex.auth.token

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.shared.auth.FlexPrincipal
import java.util.Date

/**
 * Represents the payload of a Flex access JWT.
 *
 * @property entityId the internal entity ID of the token holder
 * @property externalId the external / identity provider ID
 * @property partyId the internal party ID (0 for system roles)
 * @property role the Flex role of the token holder
 * @property scope the list of granted scopes
 * @property expiryUnixSeconds the expiry time as a Unix timestamp (seconds)
 */
data class AccessToken(
    val entityId: Int,
    val externalId: String,
    val partyId: Int = 0,
    val role: String,
    val scope: List<Scope>,
    val expiryUnixSeconds: Long,
) {
    /** The number of seconds until the token expires. */
    fun expiresIn(): Int = (expiryUnixSeconds - nowUnixSeconds()).toInt()

    /** Returns true when the token's expiry time is in the past. */
    fun isExpired(): Boolean = Date(expiryUnixSeconds * MILLIS_PER_SECOND).before(Date())

    /**
     * Signs this token with HS256 using [secret], the inverse of [parse].
     * `party_id` is left out when there is no party.
     * */
    fun sign(secret: String): String =
        JWT.create()
            .withClaim("entity_id", entityId)
            .withClaim("eid", externalId)
            .apply { if (partyId != 0) withClaim("party_id", partyId) }
            .withClaim("role", role)
            .withClaim("scope", scope.joinToString(" "))
            .withExpiresAt(Date(expiryUnixSeconds * MILLIS_PER_SECOND))
            .sign(Algorithm.HMAC256(secret))

    companion object {
        @Suppress("MagicNumber")
        private const val MILLIS_PER_SECOND = 1000L

        /** How long the access tokens issued by the auth API are valid. */
        const val DURATION_SECONDS = 3600L

        /** The role of a token that has not assumed a party. */
        private const val ENTITY_ROLE = "flex_entity"

        /** The current time as a Unix timestamp (seconds). */
        fun nowUnixSeconds(): Long = System.currentTimeMillis() / MILLIS_PER_SECOND

        /** The expiry time of a token issued now, as a Unix timestamp (seconds). */
        fun newExpiryUnixSeconds(): Long = nowUnixSeconds() + DURATION_SECONDS

        /**
         * Verifies [jwt] with HS256 using [secret], then parses the claims into an [AccessToken].
         *
         * Returns [InvalidTokenError] when the signature is wrong or claims are missing/malformed,
         * [ExpiredTokenError] when the token is syntactically valid but past its expiry.
         */
        fun parse(jwt: String, secret: String): Either<TokenError, AccessToken> =
            either {
                val verifier =
                    try {
                        JWT.require(Algorithm.HMAC256(secret)).build()
                    } catch (e: IllegalArgumentException) {
                        raise(InvalidTokenError("invalid secret: ${e.message}"))
                    }

                val decoded =
                    try {
                        verifier.verify(jwt)
                    } catch (e: JWTVerificationException) {
                        raise(InvalidTokenError(e.message ?: "verification failed"))
                    }

                val entityId = decoded.getClaim("entity_id").asInt()
                    ?: raise(InvalidTokenError("missing entity_id claim"))
                val externalId = decoded.getClaim("eid").asString()
                    ?: raise(InvalidTokenError("missing eid claim"))
                val partyId = decoded.getClaim("party_id").asInt() ?: 0
                val role = decoded.getClaim("role").asString()
                    ?: raise(InvalidTokenError("missing role claim"))
                val scopeClaim = decoded.getClaim("scope").asString()
                    ?: raise(InvalidTokenError("missing scope claim"))
                val scope = scopeClaim.split(" ").map { part ->
                    Scope.fromString(part) ?: raise(InvalidTokenError("invalid scope '$part'"))
                }
                val expiryUnixSeconds = decoded.expiresAt?.time?.div(MILLIS_PER_SECOND)
                    ?: raise(InvalidTokenError("missing exp claim"))

                val token = AccessToken(entityId, externalId, partyId, role, scope, expiryUnixSeconds)

                ensure(!token.isExpired()) { ExpiredTokenError }
                ensure(token.entityId > 0) { InvalidTokenError("entity_id must be positive") }
                ensure(token.externalId.isNotBlank()) { InvalidTokenError("eid must not be blank") }
                ensure(token.role.isNotBlank()) { InvalidTokenError("role must not be blank") }
                ensure(token.role == ENTITY_ROLE || token.partyId > 0) {
                    InvalidTokenError("party_id must be positive unless the role is $ENTITY_ROLE")
                }

                token
            }
    }
}

/** Derives a [FlexPrincipal] from this [AccessToken], extracting only the fields needed for RLS. */
fun AccessToken.toFlexPrincipal(): FlexPrincipal = FlexPrincipal(role, externalId)
