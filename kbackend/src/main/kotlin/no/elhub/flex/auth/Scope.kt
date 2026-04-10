package no.elhub.flex.auth

/**
 * Represents the privilege level ("verb") of a scope.
 *
 * Verbs are ordered: [Read] < [Use] < [Manage]. A higher-level verb covers
 * all lower-level verbs (e.g. [Manage] covers [Use] which covers [Read]).
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
 * A scope covers another when its verb is at least as permissive **and** its asset is
 * equal to or a hierarchical prefix of the other scope's asset.
 *
 * For example, `manage:data` covers `use:data:controllable_unit:lookup` because
 * [ScopeVerb.Manage] covers [ScopeVerb.Use] and `"data"` is a prefix of
 * `"data:controllable_unit:lookup"`.
 */
data class Scope(val verb: ScopeVerb, val asset: String) {

    /**
     * Returns `true` when this scope covers [other].
     *
     * Coverage requires both:
     * 1. This verb covers the other verb (equal or more permissive).
     * 2. The other asset equals this asset, or starts with this asset followed by `":"`.
     */
    fun covers(other: Scope): Boolean {
        if (!verb.covers(other.verb)) return false
        return other.asset == asset || other.asset.startsWith("$asset:")
    }

    override fun toString(): String = "${verb.name.lowercase()}:$asset"

    companion object {
        /**
         * Parses a scope string like `"use:data:controllable_unit:lookup"` into a [Scope].
         *
         * Returns `null` if the string is malformed (fewer than two colon-separated parts
         * or an unrecognised verb).
         */
        fun fromString(value: String): Scope? {
            val parts = value.split(":")
            if (parts.size < 2) return null
            val verb = ScopeVerb.fromString(parts[0]) ?: return null
            val asset = parts.drop(1).joinToString(":")
            return Scope(verb, asset)
        }
    }
}

/**
 * Returns `true` when any scope in this list [covers][Scope.covers] the given [required] scope.
 */
fun List<Scope>.covers(required: Scope): Boolean = any { it.covers(required) }
