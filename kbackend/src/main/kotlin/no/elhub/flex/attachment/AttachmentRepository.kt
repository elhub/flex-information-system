package no.elhub.flex.attachment

import arrow.core.Either
import arrow.core.left
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.query
import no.elhub.flex.db.queryRequiredSingle
import no.elhub.flex.db.querySingle
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.util.FileContentType
import java.sql.ResultSet
import java.time.OffsetDateTime

/**
 * A single row of a `<baseResource>_attachment` view.
 *
 * [parentId] is the foreign key to the owning resource table.
 */
data class AttachmentRecord(
    val id: Long,
    val parentId: Long,
    val objectId: String,
    val filename: String,
    val filenameSanitised: String,
    val contentType: String,
    val sizeBytes: Long,
    val recordedAt: OffsetDateTime,
    val recordedBy: Long,
) {
    /** Reformats a generic attachment record so it is a serializable row for a specific attachment DB resource. */
    fun specialise(baseResource: String): JsonElement =
        buildJsonObject {
            put("id", JsonPrimitive(id))
            put("${baseResource}_id", JsonPrimitive(parentId))
            put("object_id", JsonPrimitive(objectId))
            put("filename", JsonPrimitive(filename))
            put("filename_sanitised", JsonPrimitive(filenameSanitised))
            put("content_type", JsonPrimitive(contentType))
            put("size_bytes", JsonPrimitive(sizeBytes))
            put("recorded_at", JsonPrimitive(recordedAt.toString()))
            put("recorded_by", JsonPrimitive(recordedBy))
        }
}

/**
 * Repository for the attachments of a single base resource, e.g.
 * `service_providing_group_product_application_attachment`.
 */
interface AttachmentRepository {
    context(principal: FlexPrincipal)
    suspend fun list(parentId: Long): Either<RepositoryError, List<AttachmentRecord>>

    context(principal: FlexPrincipal)
    suspend fun get(id: Long): Either<RepositoryError, AttachmentRecord>

    context(principal: FlexPrincipal)
    suspend fun canEdit(parentId: Long): Either<RepositoryError, Boolean>

    context(principal: FlexPrincipal)
    suspend fun insert(
        parentId: Long,
        objectId: String,
        filename: AttachmentFilename,
        contentType: FileContentType,
        sizeBytes: Long,
    ): Either<RepositoryError, AttachmentRecord>

    context(principal: FlexPrincipal)
    suspend fun delete(id: Long): Either<RepositoryError, AttachmentRecord>
}

/**
 * Database implementation of [AttachmentRepository] for a given [baseResource].
 *
 * [baseResource] is interpolated directly into SQL to build the view name
 * (`<baseResource>_attachment`) and its foreign key column (`<baseResource>_id`), since JDBC
 * can only bind parameter *values*, not identifiers.
 *
 * One instance is required per base resource; this class is not a Koin `@Single` because Koin has
 * no way to supply [baseResource] automatically.
 */
class AttachmentRepositoryImpl(private val baseResource: String) : AttachmentRepository {
    private val view = "attachment.${baseResource}_attachment"
    private val parentIdColumn = "${baseResource}_id"

    private val selectColumns =
        "id, $parentIdColumn AS parent_id, object_id, filename, filename_sanitised, content_type, size_bytes, recorded_at, recorded_by"

    private fun rowMapper(rs: ResultSet) = AttachmentRecord(
        id = rs.getLong("id"),
        parentId = rs.getLong("parent_id"),
        objectId = rs.getString("object_id"),
        filename = rs.getString("filename"),
        filenameSanitised = rs.getString("filename_sanitised"),
        contentType = rs.getString("content_type"),
        sizeBytes = rs.getLong("size_bytes"),
        recordedAt = rs.getObject("recorded_at", OffsetDateTime::class.java),
        recordedBy = rs.getLong("recorded_by"),
    )

    context(principal: FlexPrincipal)
    override suspend fun list(parentId: Long): Either<RepositoryError, List<AttachmentRecord>> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    SELECT $selectColumns
                    FROM $view
                    WHERE $parentIdColumn = :parentId
                    ORDER BY recorded_at DESC
                    """,
                    mapOf("parentId" to parentId),
                ).query(::rowMapper)
            }.mapLeft { e ->
                DatabaseError("Failed to list $baseResource attachments for parentId=$parentId: ${e.message}")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun get(id: Long): Either<RepositoryError, AttachmentRecord> =
        flexTransaction { conn ->
            Either.catch {
                val row = conn.prepareNamed(
                    """
                    SELECT $selectColumns
                    FROM $view
                    WHERE id = :id
                    """,
                    mapOf("id" to id),
                ).querySingle(::rowMapper)
                row ?: return@flexTransaction NotFoundError("$baseResource attachment not found: id=$id").left()
            }.mapLeft { e ->
                DatabaseError("Failed to read $baseResource attachment id=$id: ${e.message}")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun canEdit(parentId: Long): Either<RepositoryError, Boolean> =
        flexTransaction { conn ->
            Either.catch {
                val canEdit = conn.prepareNamed(
                    """
                    SELECT attachment.${baseResource}_attachment_can_edit(:parentId) AS can_edit
                    """,
                    mapOf(
                        "parentId" to parentId,
                    ),
                ).querySingle { rs -> rs.getBoolean("can_edit") }
                canEdit ?: return@flexTransaction NotFoundError("$baseResource attachment not found: parentId=$parentId").left()
            }.mapLeft { e ->
                DatabaseError("Failed to check edit permission for $baseResource attachment parentId=$parentId: ${e.message}")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun insert(
        parentId: Long,
        objectId: String,
        filename: AttachmentFilename,
        contentType: FileContentType,
        sizeBytes: Long,
    ): Either<RepositoryError, AttachmentRecord> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    INSERT INTO $view ($parentIdColumn, object_id, filename, filename_sanitised, content_type, size_bytes)
                    VALUES (:parentId, :objectId::uuid, :filename, :filenameSanitised, :contentType, :sizeBytes)
                    RETURNING $selectColumns
                    """,
                    mapOf(
                        "parentId" to parentId,
                        "objectId" to objectId,
                        "filename" to filename.rawValue,
                        "filenameSanitised" to filename.value,
                        "contentType" to contentType.toString(),
                        "sizeBytes" to sizeBytes,
                    ),
                ).queryRequiredSingle(::rowMapper)
            }.mapLeft { e ->
                DatabaseError("Failed to insert $baseResource attachment: ${e.message}")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun delete(id: Long): Either<RepositoryError, AttachmentRecord> =
        flexTransaction { conn ->
            Either.catch {
                val row = conn.prepareNamed(
                    """
                    DELETE FROM $view
                    WHERE id = :id
                    RETURNING $selectColumns
                    """,
                    mapOf("id" to id),
                ).querySingle(::rowMapper)
                row ?: return@flexTransaction NotFoundError("$baseResource attachment not found: id=$id").left()
            }.mapLeft { e ->
                DatabaseError("Failed to delete $baseResource attachment id=$id: ${e.message}")
            }
        }
}
