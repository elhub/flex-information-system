package no.elhub.flex.auth.oidc

/**
 * Errors of the login with the OIDC provider. They say what went wrong, and not what to answer to the user: this is
 * decided by the handlers, which map the errors to the errors of the API.
 *
 * The errors are grouped by what the callers want to tell apart.
 */
sealed class OidcError(val message: String)

/** The discovery document of the provider cannot be read. */
data class DiscoveryError(val detail: String) : OidcError(detail)

/** The authorization request cannot be pushed to the provider. */
data class PushedAuthorizationError(val detail: String) : OidcError(detail)

/** The authorization code cannot be exchanged for tokens. */
data class TokenExchangeError(val detail: String) : OidcError(detail)

/** The ID token is not accepted. */
sealed class IdTokenError(message: String) : OidcError(message)

/** The ID token cannot be trusted: it is malformed, expired, for another client, or not signed by the provider. */
data class InvalidIdTokenError(val detail: String) : IdTokenError(detail)

/** The ID token cannot be checked because the signing keys of the provider cannot be read. */
data class KeySetError(val detail: String) : IdTokenError(detail)

/** The state or nonce returned by the provider is not the one of the login. */
sealed class VerificationError(message: String) : OidcError(message)

/** The message of the verifier is not valid. */
data class MalformedMessageError(val detail: String) : VerificationError(detail)

/** The hash is not the one of the message of the verifier. */
data object HashMismatchError : VerificationError("the hash does not match the message")

/** The login cookie is not accepted. */
sealed class LoginCookieError(message: String) : OidcError(message)

/** The login cookie is not signed by us, or it has expired. */
data class InvalidLoginCookieError(val detail: String) : LoginCookieError(detail)

/** The login cookie is signed by us, but does not have what it should have. */
data class MalformedLoginCookieError(val detail: String) : LoginCookieError(detail)
