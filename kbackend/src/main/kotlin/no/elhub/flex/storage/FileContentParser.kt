package no.elhub.flex.storage

import arrow.core.Either
import org.apache.pdfbox.Loader
import org.koin.core.annotation.Single

/** Errors that can occur when validating an uploaded file. */
sealed class FileValidationError

/** The file bytes are structurally invalid (e.g. corrupt PDF). */
data class InvalidFileContent(val reason: String) : FileValidationError()

/** Validates raw uploaded bytes into a typed [FileContent]. */
interface FileContentParser {
    /**
     * Parses [bytes] and returns a [FileContent] if valid, or a [FileValidationError] otherwise.
     *
     * @param bytes raw bytes from the upload
     */
    fun parse(bytes: ByteArray): Either<FileValidationError, FileContent>
}

/** Validates and parses uploaded file bytes using Apache PDFBox for PDF structural validation. */
@Single(createdAtStart = true)
class DefaultFileContentParser() : FileContentParser {
    override fun parse(
        bytes: ByteArray,
    ): Either<FileValidationError, FileContent> =
        parsePdf(bytes)

    private fun parsePdf(bytes: ByteArray): Either<FileValidationError, PdfFileContent> =
        Either.catch {
            val doc = Loader.loadPDF(bytes) // valid PDF if no throw
            // TODO: security checks?
            doc.close()
            PdfFileContent(bytes = bytes)
        }.mapLeft { e ->
            InvalidFileContent("Could not parse PDF: ${e.message}")
        }
}
