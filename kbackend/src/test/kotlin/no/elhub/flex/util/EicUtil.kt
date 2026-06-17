package no.elhub.flex.util

import java.util.concurrent.atomic.AtomicLong

private val eicYCounter = AtomicLong(1L)

/**
 * Generates a unique 16-character EIC-Y identifier that passes EIC check-character validation.
 *
 * Format: `10Y` + 12-digit zero-padded counter + 1 check character.
 */
@Suppress("MagicNumber")
fun uniqueEicY(): String {
    val counter = eicYCounter.getAndIncrement()
    val prefix = "10Y" + counter.toString().padStart(12, '0')
    return prefix + eicComputeCheckChar(prefix)
}

/**
 * Computes the EIC check character for a 15-character EIC prefix.
 *
 * Based on the ENTSO-E EIC coding scheme: each character is mapped to a numeric
 * value (digits 0–9 → 0–9, letters A–Z → 10–35, hyphen → 36), weighted by
 * descending position weights 16..2, summed, and the check character is
 * derived as `36 - ((sum - 1) % 37)`.
 */
@Suppress("MagicNumber")
internal fun eicComputeCheckChar(prefix: String): Char {
    require(prefix.length == 15) { "EIC prefix must be exactly 15 characters, got ${prefix.length}" }
    var sum = 0
    var weight = 16
    for (c in prefix) {
        sum += weight * eicCharToCode(c)
        weight--
    }
    return eicCodeToChar(36 - ((sum - 1) % 37))
}

private fun eicCharToCode(c: Char): Int = when {
    c.isDigit() -> c.digitToInt()
    c in 'A'..'Z' -> c.code - 'A'.code + 10
    c == '-' -> 36
    else -> error("Invalid EIC character: '$c'")
}

private fun eicCodeToChar(code: Int): Char = when {
    code in 0..9 -> '0' + code
    code in 10..35 -> 'A' + (code - 10)
    code == 36 -> '-'
    else -> error("Invalid EIC check code: $code")
}
