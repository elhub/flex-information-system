package no.elhub.flex.util

import arrow.core.Either
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.types.shouldBeInstanceOf
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

/** Tests file parsing and validation. */
class FileContentTest : FunSpec({

    // helpers

    // create a 1x1 white pixel image encoded in the given format
    fun minimalImage(format: String): ByteArray {
        val img = BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB)
        img.setRGB(0, 0, 0xFFFFFF)
        val out = ByteArrayOutputStream()
        ImageIO.write(img, format, out)
        return out.toByteArray()
    }
    fun minimalJpeg(): ByteArray = minimalImage("jpeg")
    fun minimalPng(): ByteArray = minimalImage("png")

    // create an image with the given dimensions encoded in the given format
    fun imageOfSize(width: Int, height: Int, format: String): ByteArray {
        val img = BufferedImage(width, height, BufferedImage.TYPE_INT_RGB)
        val out = ByteArrayOutputStream()
        ImageIO.write(img, format, out)
        return out.toByteArray()
    }

    // invalid PDF tests (happy path is tested in attachment test)

    test("random bytes are not a valid PDF") {
        val result = FileContent.parse(FileContentType.PDF, "not a pdf".toByteArray())

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()
    }

    test("bytes starting with %PDF header but truncated immediately after are not a valid PDF") {
        // valid header, but nothing else
        val result = FileContent.parse(FileContentType.PDF, "%PDF-1.4\n".toByteArray())

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()
    }

    test("PDF with valid header and catalog but referencing a nonexistent Pages object is rejected") {
        // plausible structure, valid startxref
        // but /Pages references an object (99) that does not exist
        val bytes = (
            "%PDF-1.4\n" +
                "1 0 obj\n<< /Type /Catalog /Pages 99 0 R >>\nendobj\n" +
                "startxref\n9\n%%EOF\n"
            ).toByteArray()

        val result = FileContent.parse(FileContentType.PDF, bytes)

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()
    }

    // JPEG tests

    test("valid JPEG with JPEG hint is accepted") {
        val result = FileContent.parse(FileContentType.JPEG, minimalJpeg())

        result.shouldBeRight()
        result.value.contentType shouldBe FileContentType.JPEG
    }

    test("valid JPEG with no hint is accepted and detected as JPEG") {
        val result = FileContent.parse(null, minimalJpeg())

        result.shouldBeRight()
        result.value.contentType shouldBe FileContentType.JPEG
    }

    test("valid JPEG with PNG hint is rejected") {
        val result = FileContent.parse(FileContentType.PNG, minimalJpeg())

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()

        val err = result.value as InvalidFileContent
        err.reason shouldContain "image/jpeg"
        err.reason shouldContain "image/png"
    }

    test("JPEG missing EOI marker is rejected") {
        val truncated = minimalJpeg().dropLast(2).toByteArray()

        val result = FileContent.parse(FileContentType.JPEG, truncated)

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()

        val err = result.value as InvalidFileContent
        err.reason shouldContain "end-of-image"
    }

    test("JPEG with truncated body (but intact header) is rejected") {
        // keep the SOI marker (FF D8 FF) so magic bytes pass, but body is garbage
        val bytes = byteArrayOf(0xFF.toByte(), 0xD8.toByte(), 0xFF.toByte()) +
            ByteArray(10) { 0x00 }

        val result = FileContent.parse(FileContentType.JPEG, bytes)

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()
    }

    test("random bytes with JPEG hint are rejected") {
        val result = FileContent.parse(FileContentType.JPEG, "not an image".toByteArray())

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()
    }

    // PNG tests

    test("valid PNG with PNG hint is accepted") {
        val result = FileContent.parse(FileContentType.PNG, minimalPng())

        result.shouldBeRight()
        result.value.contentType shouldBe FileContentType.PNG
    }

    test("valid PNG with no hint is accepted and detected as PNG") {
        val result = FileContent.parse(null, minimalPng())

        result.shouldBeRight()
        result.value.contentType shouldBe FileContentType.PNG
    }

    test("valid PNG with JPEG hint is rejected") {
        val result = FileContent.parse(FileContentType.JPEG, minimalPng())

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()

        val err = result.value as InvalidFileContent
        err.reason shouldContain "image/jpeg"
        err.reason shouldContain "image/png"
    }

    test("PNG with truncated body (but intact signature) is rejected") {
        // full 8-byte PNG signature, then garbage
        val sig = byteArrayOf(
            0x89.toByte(),
            0x50,
            0x4E,
            0x47,
            0x0D,
            0x0A,
            0x1A.toByte(),
            0x0A,
        )
        val bytes = sig + ByteArray(10) { 0x00 }

        val result = FileContent.parse(FileContentType.PNG, bytes)

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()
    }

    test("random bytes with PNG hint are rejected") {
        val result = FileContent.parse(FileContentType.PNG, "not an image".toByteArray())

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()
    }

    // no hint fallback

    test("random bytes with no hint are rejected") {
        val result = FileContent.parse(null, "not an image".toByteArray())

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()
    }

    // decompression bomb / pixel limit tests

    test("JPEG that decodes to more than 7 Mpx is rejected") {
        // 8000x8000 = 64 Mpx
        val bytes = imageOfSize(8000, 8000, "jpeg")

        val result = FileContent.parse(FileContentType.JPEG, bytes)

        result.shouldBeLeft()
        result.value.shouldBeInstanceOf<InvalidFileContent>()
    }

    test("JPEG that decodes to just below 7 Mpx is accepted") {
        // 2580x2580 = ~6.6 Mpx
        val bytes = imageOfSize(2580, 2580, "jpeg")

        val result = FileContent.parse(FileContentType.JPEG, bytes)

        result.shouldBeRight()
    }
})
