package no.elhub.flex.util

import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.toLocalDateTime
import kotlinx.datetime.todayIn
import java.sql.Timestamp
import kotlin.time.Clock
import kotlin.time.Instant
import java.time.Instant as JavaInstant

fun Instant.Companion.todayLocalMidnight(timezone: TimeZone): Instant =
    Clock.System.todayIn(timezone).atStartOfDayIn(timezone)

fun Instant.atLocalMidnight(timezone: TimeZone): Instant =
    this.toLocalDateTime(timezone).date.atStartOfDayIn(timezone)

fun Instant.toSqlTimestamp(): Timestamp =
    Timestamp.from(JavaInstant.ofEpochSecond(epochSeconds, nanosecondsOfSecond.toLong()))

fun Instant?.toSqlTimestampOrNull(): Timestamp? =
    this?.toSqlTimestamp()

fun Timestamp.toKotlinInstant(): Instant =
    toInstant().let { Instant.fromEpochSeconds(it.epochSecond, it.nano) }

fun Timestamp?.toKotlinInstantOrNull(): Instant? =
    this?.toKotlinInstant()
