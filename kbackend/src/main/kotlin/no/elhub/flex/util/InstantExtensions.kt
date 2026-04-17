package no.elhub.flex.util

import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.todayIn
import java.sql.Timestamp
import kotlin.time.Clock
import kotlin.time.Instant
import java.time.Instant as JavaInstant

fun Instant.Companion.atLocalStartOfToday(): Instant {
    val tz = TimeZone.currentSystemDefault()
    return Clock.System.todayIn(tz).atStartOfDayIn(tz)
}

fun Instant.toSqlTimestamp(): Timestamp =
    Timestamp.from(JavaInstant.ofEpochSecond(epochSeconds, nanosecondsOfSecond.toLong()))

fun Instant?.toSqlTimestampOrNull(): Timestamp? =
    this?.toSqlTimestamp()

fun Timestamp.toKotlinInstant(): Instant =
    toInstant().let { Instant.fromEpochSeconds(it.epochSecond, it.nano) }

fun Timestamp?.toKotlinInstantOrNull(): Instant? =
    this?.toKotlinInstant()
