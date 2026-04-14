package no.elhub.flex.auth

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import java.util.Date

/**
 * Represents the payload of a Flex access JWT.
 *
 * @property entityId the internal entity ID of the token holder
 * @property extId the external / identity provider ID
 * @property partyId the internal party ID (0 for system roles)
 * @property role the Flex role of the token holder
 * @property scope the list of granted scopes
 * @property exp the expiry time as a Unix timestamp (seconds)
 */
data class AccessToken(
    val entityId: Int,
    val extId: String,
    val partyId: Int = 0,
    val role: String,
    val scope: List<Scope>,
    val exp: Long,
) {
    /** Returns true when the token's expiry time is in the past. */
    fun isExpired(): Boolean = Date(exp * MILLIS_PER_SECOND).before(Date())

    companion object {
        @Suppress("MagicNumber")
        private const val MILLIS_PER_SECOND = 1000L

        /**
         * Verifies [jwt] with HS256 using [secret], then parses the claims into an [AccessToken].
         *
         * Returns [InvalidTokenError] when the signature is wrong or claims are missing/malformed,
         * [ExpiredTokenError] when the token is syntactically valid but past its expiry.
         */
        fun parse(jwt: String, secret: String): Either<AuthError, AccessToken> =
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
                val extId = decoded.getClaim("eid").asString()
                    ?: raise(InvalidTokenError("missing eid claim"))
                val partyId = decoded.getClaim("party_id").asInt() ?: 0
                val role = decoded.getClaim("role").asString()
                    ?: raise(InvalidTokenError("missing role claim"))
                val scope = decoded.getClaim("scope").asString()
                    ?.split(" ")
                    ?.mapNotNull { Scope.fromString(it) }
                    ?: raise(InvalidTokenError("missing scope claim"))
                val exp = decoded.expiresAt?.time?.div(MILLIS_PER_SECOND)
                    ?: raise(InvalidTokenError("missing exp claim"))

                val token = AccessToken(
                    entityId = entityId,
                    extId = extId,
                    partyId = partyId,
                    role = role,
                    scope = scope,
                    exp = exp,
                )

                ensure(!token.isExpired()) { ExpiredTokenError }

                ensure(token.entityId > 0) { InvalidTokenError("entity_id must be positive") }
                ensure(token.extId.isNotBlank()) { InvalidTokenError("eid must not be blank") }
                ensure(token.role.isNotBlank()) { InvalidTokenError("role must not be blank") }

                token
            }
    }
}
