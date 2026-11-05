package no.elhub.flex.api.postgrest

/** A multi-valued, insertion-ordered query string, mirroring Go's `url.Values`. */
typealias Query = MutableMap<String, MutableList<String>>

fun newQuery(): Query = LinkedHashMap()

/** The first value of [key], or `null` when absent. */
fun Query.first(key: String): String? = this[key]?.firstOrNull()

/** Replaces all values of [key] with [value]. */
fun Query.set(key: String, value: String) {
    this[key] = mutableListOf(value)
}

/** Adds [value] to the values of [key]. */
fun Query.add(key: String, value: String) {
    getOrPut(key) { mutableListOf() }.add(value)
}
