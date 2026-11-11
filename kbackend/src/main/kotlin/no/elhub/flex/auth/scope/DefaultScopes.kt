package no.elhub.flex.auth.scope

/** The scopes of an entity that has logged in and not yet assumed a party. Matches the Go backend. */
val DefaultEntityScopes: List<Scope> = listOf(
    Scope(ScopeVerb.Manage, "auth"), // to be able to assume a party
    Scope(ScopeVerb.Manage, "data"), // to be able to access their data
    Scope(ScopeVerb.Read, "grid"),
    Scope(ScopeVerb.Manage, "attachment"),
)
