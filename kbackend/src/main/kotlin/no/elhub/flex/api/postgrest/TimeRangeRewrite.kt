package no.elhub.flex.api.postgrest

import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeParseException

/** Raised when a time-range shorthand parameter (e.g. `valid_at`, `as_of`) has an invalid value. */
class InvalidTimeRangeException(val paramName: String) : Exception("invalid datetime format: $paramName")

private val rfc3339 = Regex("""^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$""")
private val extendedLocal = Regex("""^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,9})?$""")
private val knownZones: Set<String> = ZoneId.getAvailableZoneIds()

/**
 * Whether [value] is an accepted datetime: either RFC 3339 (`YYYY-MM-DDTHH:MM:SS[.FFF](Z|±HH:MM)`)
 * or the extended `YYYY-MM-DD HH:MM:SS[.FFF] <IANA timezone name>`.
 */
fun isValidDatetime(value: String): Boolean {
    if (rfc3339.matches(value)) {
        return try {
            OffsetDateTime.parse(value)
            true
        } catch (_: DateTimeParseException) {
            false
        }
    }

    val lastSpace = value.lastIndexOf(' ')
    if (lastSpace == -1) return false
    if (value.substring(lastSpace + 1) !in knownZones) return false

    val local = value.substring(0, lastSpace)
    if (!extendedLocal.matches(local)) return false

    return try {
        LocalDateTime.parse(local.replace(' ', 'T'))
        true
    } catch (_: DateTimeParseException) {
        false
    }
}

/**
 * Rewrites a shorthand parameter (e.g. `valid_at`, or prefixed as `<relation>.valid_at`) into an `and` filter
 * on [fromCol] and an `or` filter on [toCol].
 *
 * @throws InvalidTimeRangeException if a value is not a valid datetime
 */
fun timeRangeQueryRewrite(query: Query, paramName: String, fromCol: String, toCol: String) {
    for (key in query.keys.toList()) {
        if (key != paramName && !key.endsWith(".$paramName")) continue

        val keyAnd = key.dropLast(paramName.length) + "and"
        val value = query.first(key)
        if (value.isNullOrEmpty()) continue

        if (!isValidDatetime(value)) throw InvalidTimeRangeException(paramName)

        query.remove(key)
        query.add(keyAnd, "($fromCol.lte.$value,or($toCol.gt.$value,$toCol.is.null))")
    }
}

/** Rewrites `valid_at` into filters on `valid_from` and `valid_to`. */
fun validAtQueryRewrite(query: Query) = timeRangeQueryRewrite(query, "valid_at", "valid_from", "valid_to")

/** Rewrites `as_of` into filters on `recorded_at` and `replaced_at`. */
fun asOfQueryRewrite(query: Query) = timeRangeQueryRewrite(query, "as_of", "recorded_at", "replaced_at")
