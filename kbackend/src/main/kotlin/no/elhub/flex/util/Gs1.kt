package no.elhub.flex.util

private val GSRN_REGEX = "^[1-9][0-9]{17}$".toRegex()

/**
 * Returns true when [gsrn] is an 18-digit GS1 GSRN code with a valid check digit.
 *
 * The check digit algorithm alternates multipliers of 3 and 1, scanning right-to-left
 * over the first 17 digits, then computes `(10 - (sum mod 10)) mod 10`.
 */
fun isValidGsrn(gsrn: String): Boolean {
    if (!GSRN_REGEX.matches(gsrn)) return false

    var multiplier = 3
    var sum = 0

    for (i in gsrn.length - 2 downTo 0) {
        sum += gsrn[i].digitToInt() * multiplier
        multiplier = if (multiplier == 3) 1 else 3
    }

    @Suppress("MagicNumber")
    val expectedCheckDigit = (10 - (sum % 10)) % 10

    return gsrn.last().digitToInt() == expectedCheckDigit
}
