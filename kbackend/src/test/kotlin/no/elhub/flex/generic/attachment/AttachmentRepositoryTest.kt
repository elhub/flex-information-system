package no.elhub.flex.generic.attachment

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.db.NotFoundError

/**
 * Exercises [AttachmentRepositoryImpl] against a throwaway `flex.widget_attachment` table that
 * mimics the shape generated for any real base resource (see
 * `local/scripts/templates/attachment_resource.j2.sql`), so the dynamically built SQL is verified
 * against real Postgres without depending on any specific resource's fixture data.
 */
class AttachmentRepositoryTest : FunSpec({

    val repo = AttachmentRepositoryImpl("widget")
    val principal = FlexPrincipal.internalData()

    beforeSpec {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { stmt ->
                stmt.execute(
                    """
                    CREATE TABLE IF NOT EXISTS flex.widget_attachment (
                        id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                        widget_id bigint NOT NULL,
                        object_id text NOT NULL UNIQUE,
                        name text NOT NULL,
                        content_type text NOT NULL DEFAULT 'application/pdf',
                        size_bytes bigint NOT NULL,
                        record_time_range tstzrange NOT NULL DEFAULT tstzrange(localtimestamp, null, '[)'),
                        recorded_by bigint NOT NULL DEFAULT 0
                    )
                    """.trimIndent(),
                )
                stmt.execute("GRANT SELECT, INSERT, DELETE ON flex.widget_attachment TO flex_internal_data")
                stmt.execute("GRANT USAGE, SELECT ON SEQUENCE flex.widget_attachment_id_seq TO flex_internal_data")
            }
        }
    }

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { it.execute("TRUNCATE flex.widget_attachment RESTART IDENTITY") }
        }
    }

    suspend fun insert(parentId: Long, objectId: String) =
        with(principal) {
            repo.insert(
                parentId = parentId,
                objectId = objectId,
                name = "file.pdf",
                contentType = "application/pdf",
                sizeBytes = 1_234L,
            )
        }.shouldBeRight()

    context("insert") {
        test("inserts and returns the created record") {
            val record = insert(parentId = 1L, objectId = "obj-1")

            record.parentId shouldBe 1L
            record.objectId shouldBe "obj-1"
            record.name shouldBe "file.pdf"
            record.contentType shouldBe "application/pdf"
            record.sizeBytes shouldBe 1_234L
            record.recordedBy shouldBe 0L
        }
    }

    context("get") {
        test("returns the record by id") {
            val inserted = insert(parentId = 2L, objectId = "obj-2")

            val result = with(principal) { repo.get(inserted.id) }.shouldBeRight()

            result shouldBe inserted
        }

        test("returns NotFoundError when the id does not exist") {
            val result = with(principal) { repo.get(-1L) }

            result.shouldBeLeft() shouldBe NotFoundError("widget attachment not found: id=-1")
        }
    }

    context("list") {
        test("returns only the attachments belonging to the given parent") {
            val first = insert(parentId = 3L, objectId = "obj-a")
            val second = insert(parentId = 3L, objectId = "obj-b")
            insert(parentId = 4L, objectId = "obj-other")

            val result = with(principal) { repo.list(3L) }.shouldBeRight()

            result shouldContainExactlyInAnyOrder listOf(first, second)
        }

        test("returns an empty list when the parent has no attachments") {
            val result = with(principal) { repo.list(999L) }.shouldBeRight()

            result shouldBe emptyList()
        }
    }

    context("delete") {
        test("deletes and returns the removed record") {
            val inserted = insert(parentId = 5L, objectId = "obj-5")

            val deleted = with(principal) { repo.delete(inserted.id) }.shouldBeRight()
            deleted shouldBe inserted

            with(principal) { repo.get(inserted.id) }.shouldBeLeft()
        }

        test("returns NotFoundError when the id does not exist") {
            val result = with(principal) { repo.delete(-1L) }

            result.shouldBeLeft() shouldBe NotFoundError("widget attachment not found: id=-1")
        }
    }
})
