package no.elhub.flex.api.postgrest

import arrow.core.raise.Raise
import arrow.core.raise.ensure
import io.ktor.http.HttpStatusCode
import io.ktor.http.ParametersBuilder
import java.time.DateTimeException
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeFormatterBuilder
import java.time.format.ResolverStyle
import java.time.temporal.ChronoField
import java.time.temporal.TemporalQuery

private val rfc3339 = Regex("""^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$""")
private val knownZones: Set<String> = ZoneId.getAvailableZoneIds()

private const val NANO_DIGITS = 9

/** `YYYY-MM-DD HH:MM:SS[.FFF] <zone>`, strict so that dates like February 30th are rejected. */
private val extendedFormat: DateTimeFormatter = DateTimeFormatterBuilder()
    .appendPattern("uuuu-MM-dd HH:mm:ss")
    .optionalStart()
    .appendFraction(ChronoField.NANO_OF_SECOND, 1, NANO_DIGITS, true)
    .optionalEnd()
    .appendLiteral(' ')
    .appendZoneRegionId()
    .toFormatter()
    .withResolverStyle(ResolverStyle.STRICT)

/**
 * Whether [value] is an accepted datetime: either RFC 3339 (`YYYY-MM-DDTHH:MM:SS[.FFF](Z|±HH:MM)`)
 * or the extended `YYYY-MM-DD HH:MM:SS[.FFF] <IANA timezone name>`.
 */
fun isValidDatetime(value: String): Boolean = isRfc3339(value) || isExtendedDatetime(value)

private fun isRfc3339(value: String): Boolean =
    rfc3339.matches(value) && runCatching { OffsetDateTime.parse(value) }.isSuccess

private fun isExtendedDatetime(value: String): Boolean {
    val zone = try {
        extendedFormat.parse(value, TemporalQuery { ZoneId.from(it) })
    } catch (_: DateTimeException) {
        return false
    }
    // offsets such as +01:00 parse as zones too, but only named zones are accepted
    return zone.id in knownZones
}

/**
 * Rewrites a shorthand parameter (e.g. `valid_at`, or prefixed as `<relation>.valid_at`) into an `and` filter
 * on [fromColumn] and an `or` filter on [toColumn].
 *
 * Raises a [RequestRejection] if a value is not a valid datetime.
 */
fun Raise<RequestRejection>.rewriteTimeRange(
    query: ParametersBuilder,
    paramName: String,
    fromColumn: String,
    toColumn: String,
) {
    for (key in query.names().toList()) {
        if (key != paramName && !key.endsWith(".$paramName")) continue

        val value = query[key]
        if (value.isNullOrEmpty()) continue

        ensure(isValidDatetime(value)) {
            RequestRejection(HttpStatusCode.BadRequest, "invalid datetime format: $paramName")
        }

        val andKey = key.removeSuffix(paramName) + "and"
        query.remove(key)
        query.append(andKey, "($fromColumn.lte.$value,or($toColumn.gt.$value,$toColumn.is.null))")
    }
}

/** Rewrites `valid_at` into filters on `valid_from` and `valid_to`. */
fun Raise<RequestRejection>.rewriteValidAt(query: ParametersBuilder) =
    rewriteTimeRange(query, "valid_at", "valid_from", "valid_to")

/** Rewrites `as_of` into filters on `recorded_at` and `replaced_at`. */
fun Raise<RequestRejection>.rewriteAsOf(query: ParametersBuilder) =
    rewriteTimeRange(query, "as_of", "recorded_at", "replaced_at")
