package no.elhub.flex.attachment

import arrow.core.Either
import arrow.core.raise.either
import no.elhub.flex.model.error.ParsingError

@ConsistentCopyVisibility
data class AttachmentFilename private constructor(
    val value: String,
) {
    /** Factory for parsing [AttachmentFilename] values. */
    companion object {
        /** Parses an [AttachmentFilename] from the given string. */
        fun parse(str: String): Either<ParsingError, AttachmentFilename> =
            either {
                val sanitised = str.filter { it.isLetterOrDigit() || it == '.' || it == '-' || it == '_' }

                if (sanitised.isEmpty()) {
                    raise(ParsingError("Attachment filename must contain at least one valid character"))
                }
                if (!sanitised.first().isLetter()) {
                    raise(ParsingError("Attachment filename must start with a letter"))
                }

                AttachmentFilename(sanitised)
            }
    }
}
