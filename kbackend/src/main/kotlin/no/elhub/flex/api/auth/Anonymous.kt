package no.elhub.flex.api.auth

import io.ktor.server.application.ApplicationCall

/** The role of callers that present no token. */
const val ANONYMOUS_ROLE = "flex_anonymous"

/**
 * The scopes of callers that present no token: they can log in and read open data (if any).
 * Matches the default anonymous scopes of the Go backend.
 */
val AnonymousScopes: List<Scope> = listOf(
    Scope(ScopeVerb.Use, "auth"),
    Scope(ScopeVerb.Read, "data"),
)

/** The scopes of the caller: those of the verified token, or the [AnonymousScopes] when there is none. */
fun ApplicationCall.callerScopes(): List<Scope> = attributes.getOrNull(AccessTokenKey)?.scope ?: AnonymousScopes
