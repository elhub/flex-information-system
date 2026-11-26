package no.elhub.flex.api.util

import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlin.time.Instant

fun LocalDate.asLocalMidnightInstant(timezone: TimeZone): Instant = this.atStartOfDayIn(timezone)
