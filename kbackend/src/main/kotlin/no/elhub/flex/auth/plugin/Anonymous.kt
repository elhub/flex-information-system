package no.elhub.flex.auth.plugin

import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.principal
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.token.AccessToken

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

/**
 * The scopes of the caller: those of the verified token, or the [AnonymousScopes] when there is none.
 * Only meaningful on routes declared with [optionalAuthenticatedRouting].
 */
fun ApplicationCall.callerScopes(): List<Scope> = principal<AccessToken>()?.scope ?: AnonymousScopes
