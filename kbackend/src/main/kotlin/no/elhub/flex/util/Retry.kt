package no.elhub.flex.util

import arrow.core.Either
import io.github.oshai.kotlinlogging.KotlinLogging

private val logger = KotlinLogging.logger {}

/**
 * Runs [block] retrying when the result is [Either.Left], logging a warning on each failure.
 * Retries up to [times] times.
 * Returns the first [Either.Right] result, or the last [Either.Left] if all attempts fail.
 */
tailrec suspend fun <L, R> retry(
    times: UInt,
    description: String,
    block: suspend () -> Either<L, R>,
): Either<L, R> =
    when (val result = block()) {
        is Either.Right -> result

        is Either.Left -> {
            if (times == 0u) {
                logger.warn { "'$description' failed, max attempts reached" }
                result
            } else {
                logger.warn { "'$description' failed, retrying" }
                retry(times - 1u, description, block)
            }
        }
    }
