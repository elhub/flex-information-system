package no.elhub.flex.util

import java.util.concurrent.atomic.AtomicLong

private val gsrnCounter = AtomicLong(10_000_000L)

/**
 * Generates a unique 18-digit GSRN that passes GS1 check-digit validation.
 */
@Suppress("MagicNumber")
fun uniqueGsrn(): String {
    val next = gsrnCounter.getAndIncrement()
    require(next <= 99_999_999L) { "Exhausted unique GSRN values in this JVM" }
    val suffix = next.toString().padStart(8, '0')
    val partial = "1337$suffix" + "0".repeat(5)
    return partial + gs1CheckDigit(partial)
}

/** Computes the GS1 check digit for a 17-digit partial GS1 number. */
@Suppress("MagicNumber")
internal fun gs1CheckDigit(partial: String): Int {
    var multiplier = 3
    var sum = 0
    for (ch in partial.reversed()) {
        sum += ch.digitToInt() * multiplier
        multiplier = if (multiplier == 3) 1 else 3
    }
    return (10 - sum % 10) % 10
}
