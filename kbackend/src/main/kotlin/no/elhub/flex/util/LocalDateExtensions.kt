package no.elhub.flex.util

import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.toLocalDateTime
import kotlinx.datetime.todayIn
import kotlin.time.Clock

fun LocalDate.Companion.now(): LocalDate = Clock.System.todayIn(TimeZone.currentSystemDefault())

fun LocalDate.atStartOfDay(): LocalDateTime {
    val timeZone = TimeZone.currentSystemDefault()
    return this.atStartOfDayIn(timeZone).toLocalDateTime(timeZone)
}
