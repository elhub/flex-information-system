package no.elhub.flex.auth

/**
 * Represents the privilege level ("verb") of a scope.
 *
 * Verbs are ordered: [Read] < [Use] < [Manage]. A higher-level verb covers all lower-level verbs.
 */
enum class ScopeVerb(val level: Int) {
    Read(1),
    Use(2),
    Manage(3),
    ;

    /** Returns `true` when this verb is at least as permissive as [other]. */
    fun covers(other: ScopeVerb): Boolean = level >= other.level

    companion object {
        /** Parses a lowercase verb string (e.g. `"use"`) into a [ScopeVerb], or `null` if invalid. */
        fun fromString(value: String): ScopeVerb? = entries.find { it.name.equals(value, ignoreCase = true) }
    }
}

/**
 * Represents an access scope consisting of a [verb] and a hierarchical [asset] path.
 *
 * The asset is a colon-separated hierarchy (e.g. `"data:controllable_unit:lookup"`).
 */
data class Scope(val verb: ScopeVerb, val asset: String) {

    /**
     * Returns `true` when this scope covers [other].
     *
     * A scope covers another when its verb covers the other verb, and the asset is a prefix of the other asset.
     * For instance, `manage:data` covers `use:data:controllable_unit`.
     */
    fun covers(other: Scope): Boolean {
        if (!verb.covers(other.verb)) return false
        return other.asset == asset || other.asset.startsWith("$asset:")
    }

    override fun toString(): String = "${verb.name.lowercase()}:$asset"

    companion object {

        /** Tries to parse a scope string like into a [Scope]. */
        fun fromString(value: String): Scope? {
            val parts = value.split(":")
            if (parts.size < 2) return null
            val verb = ScopeVerb.fromString(parts[0]) ?: return null
            val asset = parts.drop(1).joinToString(":")
            return Scope(verb, asset)
        }
    }
}

/** Returns `true` when any scope in this list [covers][Scope.covers] the given [required] scope. */
fun List<Scope>.covers(required: Scope): Boolean = any { it.covers(required) }
