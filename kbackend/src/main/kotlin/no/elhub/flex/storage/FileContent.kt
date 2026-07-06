package no.elhub.flex.storage

enum class FileContentType {
    PDF;

    override fun toString() = when (this) {
        PDF -> "application/pdf"
    }
}

/** Represents validated file content ready to be stored. */
sealed class FileContent {
    abstract val contentType: FileContentType
    abstract val bytes: ByteArray
}

data class PdfFileContent(override val bytes: ByteArray) : FileContent() {
    override val contentType = FileContentType.PDF

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is PdfFileContent) return false
        return bytes.contentEquals(other.bytes)
    }

    override fun hashCode(): Int = bytes.contentHashCode()
}
