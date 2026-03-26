package no.elhub.flex.util

import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlin.time.Instant

fun LocalDate.asLocalStartOfDayInstant(): Instant = this.atStartOfDayIn(TimeZone.currentSystemDefault())
