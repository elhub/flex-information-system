package no.elhub.flex.auth

/** Errors that can occur during authentication and authorisation. */
sealed class AuthError(val message: String)

/** The request is missing an `Authorization: Bearer` header. */
data object MissingTokenError : AuthError("Missing Authorization header")

/** The JWT signature is invalid, the token is malformed, or claims are missing. */
data class InvalidTokenError(val details: String) : AuthError("Invalid token: $details")

/** The JWT has passed its expiry time. */
data object ExpiredTokenError : AuthError("Token has expired")

/** The token's role is not permitted to call the requested endpoint. */
data class InsufficientRoleError(val role: String) : AuthError("Role '$role' cannot perform this operation")

/** The token's scopes do not cover the scope required by the endpoint. */
data class InsufficientScopeError(val required: Scope) : AuthError("Insufficient scope for this operation: required '$required'")
