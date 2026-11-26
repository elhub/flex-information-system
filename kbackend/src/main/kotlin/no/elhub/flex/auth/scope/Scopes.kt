package no.elhub.flex.auth.scope

/** The scopes of an entity that has logged in and not yet assumed a party. */
val DefaultEntityScopes: List<Scope> = listOf(
    Scope(ScopeVerb.Manage, "auth"), // to be able to assume a party
    Scope(ScopeVerb.Manage, "data"), // to be able to access their data
    Scope(ScopeVerb.Read, "grid"),
    Scope(ScopeVerb.Manage, "attachment"),
)

/** The scopes of a party that an entity owns, i.e. full read-write access. */
val DefaultOwnedPartyScopes: List<Scope> = listOf(
    Scope(ScopeVerb.Manage, "auth"),
    Scope(ScopeVerb.Manage, "data"),
    Scope(ScopeVerb.Read, "grid"),
    Scope(ScopeVerb.Manage, "attachment"),
)

/**
 * The intersection of two scopes, or `null` if they do not intersect.
 * It is the part of the asset that is common to both scopes, with the less permissive verb.
 */
fun Scope.intersection(other: Scope): Scope? {
    val verb = if (verb.level <= other.verb.level) verb else other.verb
    return when {
        asset == other.asset -> Scope(verb, asset)
        asset.startsWith("${other.asset}:") -> Scope(verb, asset)
        other.asset.startsWith("$asset:") -> Scope(verb, other.asset)
        else -> null
    }
}

/**
 * The intersection of two lists of scopes: the intersections of all pairs of scopes that intersect,
 * without duplicates and sorted by asset, then verb. If there is no intersection, the result is
 * empty.
 */
fun List<Scope>.intersection(other: List<Scope>): List<Scope> =
    flatMap { a -> other.mapNotNull { b -> a.intersection(b) } }
        .distinct()
        .sortedWith(compareBy({ it.asset }, { it.verb.level }))
