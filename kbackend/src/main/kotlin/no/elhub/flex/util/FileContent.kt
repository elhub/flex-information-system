package no.elhub.flex.util

import arrow.core.Either
import arrow.core.left
import org.apache.pdfbox.Loader

// file content parsing utilities

/** Supported file type in the application. */
enum class FileContentType {
    PDF,
    JPEG,
    PNG;

    override fun toString() = when (this) {
        PDF -> "application/pdf"
        JPEG -> "image/jpeg"
        PNG -> "image/png"
    }

    companion object {
        /** Tries to read a supported file content type from a given string. */
        fun fromString(str: String): FileContentType? = when (str) {
            "application/pdf" -> PDF
            "image/jpeg" -> JPEG
            "image/png" -> PNG
            else -> null
        }

        /** Tries to read a supported file content type from the extension of a filename. */
        fun fromFilename(filename: String): FileContentType? =
            filename.substringAfterLast('.', "").lowercase().let { ext ->
                when (ext) {
                    "pdf" -> PDF
                    "jpeg" -> JPEG
                    "jpg" -> JPEG
                    "png" -> PNG
                    else -> null
                }
            }
    }
}

/** Represents validated file content ready to be stored. */
data class FileContent(
    val contentType: FileContentType,
    val bytes: ByteArray
) {
    companion object {
        /**
         * Parses [bytes] and returns a [FileContent] if valid, or a [FileValidationError] otherwise.
         *
         * @param contentType content type hint possibly extracted from the request body or the filename
         * @param bytes raw bytes from the upload
         */
        fun parse(
            contentType: FileContentType?,
            bytes: ByteArray
        ): Either<FileValidationError, FileContent> =
            contentType?.let {
                // given hint -> use the associated parser
                when (it) {
                    FileContentType.PDF -> parsePdf(bytes)
                    else -> InvalidFileContent("Unsupported file type: $contentType").left()
                }
            } ?: run {
                // no hint -> try parsers one after the other
                parsePdf(bytes) orElse { parseImage(bytes) }
            }
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as FileContent

        if (contentType != other.contentType) return false
        if (!bytes.contentEquals(other.bytes)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = contentType.hashCode()
        result = 31 * result + bytes.contentHashCode()
        return result
    }
}

private fun parsePdf(bytes: ByteArray): Either<FileValidationError, FileContent> =
    Either.catch {
        val doc = Loader.loadPDF(bytes) // valid PDF if no throw
        // TODO: security checks?
        doc.close()
        FileContent(contentType = FileContentType.PDF, bytes = bytes)
    }.mapLeft { e ->
        InvalidFileContent("Could not parse PDF: ${e.message}")
    }

private fun parseImage(bytes: ByteArray): Either<FileValidationError, FileContent> =
    InvalidFileContent("unimplemented").left()

/** Errors that can occur when validating an uploaded file. */
sealed class FileValidationError

/** The file bytes are structurally invalid (e.g. corrupt PDF). */
data class InvalidFileContent(val reason: String) : FileValidationError()
