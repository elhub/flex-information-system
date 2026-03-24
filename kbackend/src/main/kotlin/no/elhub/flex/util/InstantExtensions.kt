package no.elhub.flex.util

import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.todayIn
import kotlin.time.Clock
import kotlin.time.Instant

fun Instant.Companion.atLocalStartOfToday(): Instant {
    val tz = TimeZone.currentSystemDefault()
    return Clock.System.todayIn(tz).atStartOfDayIn(tz)
}
