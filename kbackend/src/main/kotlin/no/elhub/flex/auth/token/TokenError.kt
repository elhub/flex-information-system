package no.elhub.flex.auth.token

import no.elhub.flex.auth.scope.Scope

/** Errors that can occur during authentication and authorisation. */
sealed class TokenError(val message: String)

/** The request is missing an `Authorization: Bearer` header. */
data object MissingTokenError : TokenError("Missing Authorization header")

/** The JWT signature is invalid, the token is malformed, or claims are missing. */
data class InvalidTokenError(val details: String) : TokenError("Invalid token: $details")

/** The JWT has passed its expiry time. */
data object ExpiredTokenError : TokenError("Token has expired")

/** The token's role is not permitted to call the requested endpoint. */
data class InsufficientRoleError(val role: String) : TokenError("Role '$role' cannot perform this operation")
