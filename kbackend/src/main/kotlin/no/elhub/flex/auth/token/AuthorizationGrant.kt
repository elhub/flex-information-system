package no.elhub.flex.auth.token

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlin.math.abs

private const val GLN_LENGTH = 13
private const val UUID_LENGTH = 36
private const val MAX_GRANT_LIFETIME_SECONDS = 120
private const val MAX_IAT_SKEW_SECONDS = 10
private const val MILLIS_PER_SECOND = 1000L

private const val SUBJECT_PREFIX = "no:party:"

private val UUID_REGEX = Regex("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")

/** The set of valid party type values. */
private val VALID_PARTY_TYPES = setOf(
    "balance_responsible_party",
    "end_user",
    "energy_supplier",
    "flexibility_information_system_operator",
    "market_operator",
    "organisation",
    "service_provider",
    "system_operator",
    "third_party",
)

private val lenientJson = Json { ignoreUnknownKeys = true }

/** Returns true if the string is a UUID in its canonical hyphenated form. */
private fun isUuid(value: String): Boolean = UUID_REGEX.matches(value)

/** Errors that can occur when reading an authorization grant. */
sealed class GrantError(val message: String)

/** The payload is not a JSON object with claims of the right types. */
data class MalformedGrantError(val details: String) : GrantError("invalid assertion payload format: $details")

/** The `sub` claim is not a valid subject. */
data class InvalidSubjectError(val reason: String) :
    GrantError("invalid assertion payload format: invalid subject: $reason")

/** The claims of the grant are not valid, e.g. it is expired or its lifetime is too long. */
data class InvalidGrantError(val problems: List<String>) :
    GrantError("invalid assertion payload: ${problems.joinToString(", ")}")

/**
 * The `sub` claim of an authorization grant token: the party to assume.
 *
 * @property identifierType the type of the identifier, either `gln` or `uuid`
 * @property identifier the identifier of the party
 * @property partyType the type of the party to assume
 */
data class GrantSubject(
    val identifierType: String,
    val identifier: String,
    val partyType: String,
) {
    override fun toString(): String = "$SUBJECT_PREFIX$identifierType:$identifier:$partyType"

    companion object {
        /** Parses a subject like `no:party:gln:1234567890123:service_provider`. */
        fun parse(value: String): Either<InvalidSubjectError, GrantSubject> =
            either {
                val lenShortestType = "end_user".length
                val lenLongestType = "flexibility_information_system_operator".length
                val minLen = "no:party:gln:".length + GLN_LENGTH + 1 + lenShortestType
                val maxLen = "no:party:uuid:".length + UUID_LENGTH + 1 + lenLongestType

                ensure(value.length >= minLen) { InvalidSubjectError("too short") }
                ensure(value.length <= maxLen) { InvalidSubjectError("too long") }

                ensure(value.startsWith(SUBJECT_PREFIX)) { InvalidSubjectError("incorrect subject prefix") }

                val parts = value.removePrefix(SUBJECT_PREFIX).split(":")
                ensure(parts.size == 3) { InvalidSubjectError("incorrect number of parts") }

                val (identifierType, identifier, partyType) = parts

                ensure(identifierType == "gln" || identifierType == "uuid") {
                    InvalidSubjectError("invalid identifier type")
                }

                if (identifierType == "uuid") {
                    ensure(isUuid(identifier)) { InvalidSubjectError("invalid uuid identifier") }
                } else {
                    // GLN is integer-looking
                    ensure(identifier.toLongOrNull() != null) { InvalidSubjectError("invalid numeric identifier") }
                    ensure(identifier.length == GLN_LENGTH) { InvalidSubjectError("invalid gln identifier") }
                }

                ensure(partyType in VALID_PARTY_TYPES) { InvalidSubjectError("invalid party type") }

                GrantSubject(identifierType, identifier, partyType)
            }
    }
}

/**
 * The payload of an authorization grant token.
 * This is an implementation of [RFC 7523 section 4](https://datatracker.ietf.org/doc/html/rfc7523#section-4).
 * Claims follow [RFC 7519 section 4](https://datatracker.ietf.org/doc/html/rfc7519#section-4).
 * The structure of the token is inspired by the
 * [Maskinporten grant tokens](https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_jwtgrant).
 *
 * A grant that exists is valid, as it can only be made with [parse].
 *
 * @property audience the intended audience of the token, the URL of the auth API
 * @property issuer the UUID of the entity client that issued and signed the token
 * @property issuedAt the time at which the token was issued, as a Unix timestamp (seconds)
 * @property expirationTime the time at which the token expires, as a Unix timestamp (seconds).
 *   The maximum lifetime of the token is 120 seconds.
 * @property jwtId a unique identifier for the token, for (future) protection against replay attacks
 * @property subject the party on behalf of whom the new token is being requested.
 *   If omitted, the returned access token will be for the issuer entity.
 */
data class AuthorizationGrant(
    val audience: String,
    val issuer: String,
    val issuedAt: Long,
    val expirationTime: Long,
    val jwtId: String,
    val subject: GrantSubject?,
) {
    /** The claims as they are in the payload. Missing ones are empty, so that all the problems are reported at once. */
    @Serializable
    private data class Payload(
        @SerialName("aud") val audience: String = "",
        @SerialName("iss") val issuer: String = "",
        @SerialName("iat") val issuedAt: Long = 0,
        @SerialName("exp") val expirationTime: Long = 0,
        @SerialName("jti") val jwtId: String = "",
        @SerialName("sub") val subject: String? = null,
    )

    companion object {
        /**
         * Reads and validates the grant in the JSON [payload] of a JWT.
         * The claims are checked against [nowUnixSeconds].
         */
        fun parse(
            payload: String,
            nowUnixSeconds: Long = System.currentTimeMillis() / MILLIS_PER_SECOND,
        ): Either<GrantError, AuthorizationGrant> =
            either {
                val raw = Either.catch { lenientJson.decodeFromString<Payload>(payload) }
                    .mapLeft { MalformedGrantError(it.message.orEmpty()) }
                    .bind()

                val subject = raw.subject?.let { GrantSubject.parse(it).bind() }

                val problems = validate(raw, nowUnixSeconds)
                ensure(problems.isEmpty()) { InvalidGrantError(problems) }

                AuthorizationGrant(raw.audience, raw.issuer, raw.issuedAt, raw.expirationTime, raw.jwtId, subject)
            }

        /** Checks that the claims are all set in the correct ways, and returns the problems. */
        private fun validate(raw: Payload, nowUnixSeconds: Long): List<String> =
            buildList {
                if (raw.audience.isEmpty()) add("aud is empty")
                if (!isUuid(raw.issuer)) add("iss is not a valid UUID")
                if (abs(raw.issuedAt - nowUnixSeconds) >= MAX_IAT_SKEW_SECONDS) {
                    add("iat must be within 10 seconds of server time")
                }
                if (raw.expirationTime - raw.issuedAt > MAX_GRANT_LIFETIME_SECONDS) add("maximum lifetime is 120 seconds")
                if (raw.expirationTime <= raw.issuedAt) add("iat must be before exp")
                if (raw.jwtId.isEmpty()) add("jti is empty")
            }
    }
}
