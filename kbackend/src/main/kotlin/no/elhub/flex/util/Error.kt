package no.elhub.flex.util

/**
 * Custom type for all errors in the app.
 *
 * @property message details about the error
 */
abstract class AppError(
    val message: String? = null,
)

/**
 * Error indicating a header is missing from the request.
 *
 * @property name the name of the missing header
 */
data class MissingHeaderError(
    val name: String,
) : AppError("Missing header '$name'")

/**
 * Error indicating that something could not be parsed correctly.
 *
 * @property details details about the problem
 */
data class ParsingError(
    val details: String,
) : AppError(details)
