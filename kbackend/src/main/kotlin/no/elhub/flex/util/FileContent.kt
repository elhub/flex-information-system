package no.elhub.flex.util

import arrow.core.Either
import arrow.core.left
import arrow.core.raise.either
import org.apache.pdfbox.Loader
import javax.imageio.ImageIO

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
                    FileContentType.JPEG, FileContentType.PNG -> parseImage(bytes, it)
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
        // TODO: content disarm?
        doc.close()
        FileContent(contentType = FileContentType.PDF, bytes = bytes)
    }.mapLeft { e ->
        InvalidFileContent("Could not parse PDF: ${e.message}")
    }

private fun parseImage(
    bytes: ByteArray,
    expectedContentType: FileContentType? = null,
): Either<FileValidationError, FileContent> =
    either {
        // magic byte detection
        val detectedContentType = when {
            bytes.size >= 3 &&
                bytes[0] == 0xFF.toByte() &&
                bytes[1] == 0xD8.toByte() &&
                bytes[2] == 0xFF.toByte() -> FileContentType.JPEG

            bytes.size >= 8 &&
                bytes[0] == 0x89.toByte() &&
                bytes[1] == 0x50.toByte() && // P
                bytes[2] == 0x4E.toByte() && // N
                bytes[3] == 0x47.toByte() && // G
                bytes[4] == 0x0D.toByte() &&
                bytes[5] == 0x0A.toByte() &&
                bytes[6] == 0x1A.toByte() &&
                bytes[7] == 0x0A.toByte() -> FileContentType.PNG

            else -> raise(InvalidFileContent("Not a recognised image format (bad magic bytes)"))
        }

        // magic bytes must agree with the hint when given
        if (expectedContentType != null && detectedContentType != expectedContentType) {
            raise(
                InvalidFileContent(
                    "File content looks like $detectedContentType but content type indicates $expectedContentType"
                )
            )
        }

        // structural decode via ImageIO
        val image = Either.catch {
            ImageIO.read(bytes.inputStream())
        }.mapLeft { e -> InvalidFileContent("Could not decode image: ${e.message}") }.bind()
            ?: raise(InvalidFileContent("Could not decode image: unrecognised or truncated data"))
        image.flush()

        // JPEG only: verify EOI marker at end of file
        if (detectedContentType == FileContentType.JPEG) {
            val n = bytes.size
            if (bytes[n - 2] != 0xFF.toByte() || bytes[n - 1] != 0xD9.toByte()) {
                raise(InvalidFileContent("JPEG is missing end-of-image marker (truncated file)"))
            }
        }

        // TODO: content disarm?

        FileContent(contentType = detectedContentType, bytes = bytes)
    }

/** Errors that can occur when validating an uploaded file. */
sealed class FileValidationError

/** The file bytes are structurally invalid (e.g. corrupt PDF). */
data class InvalidFileContent(val reason: String) : FileValidationError()
