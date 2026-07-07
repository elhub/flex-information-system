package no.elhub.flex.generic.attachment

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
import java.sql.ResultSet
import java.time.OffsetDateTime

/**
 * A single row of a `<baseResource>_attachment` table.
 *
 * [parentId] is the foreign key to the owning resource table.
 */
data class AttachmentRecord(
    val id: Long,
    val parentId: Long,
    val objectId: String,
    val name: String,
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
            put("name", JsonPrimitive(name))
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
    suspend fun insert(
        parentId: Long,
        objectId: String,
        name: String,
        contentType: String,
        sizeBytes: Long,
    ): Either<RepositoryError, AttachmentRecord>

    context(principal: FlexPrincipal)
    suspend fun delete(id: Long): Either<RepositoryError, AttachmentRecord>
}

/**
 * [AttachmentRepository] for the `flex.<baseResource>_attachment` table.
 *
 * [baseResource] is interpolated directly into SQL to build the table name
 * (`flex.<baseResource>_attachment`) and its foreign key column (`<baseResource>_id`), since JDBC
 * can only bind parameter *values*, not identifiers.
 *
 * One instance is required per base resource; this class is not a Koin `@Single` because Koin has
 * no way to supply [baseResource] automatically.
 */
class AttachmentRepositoryImpl(private val baseResource: String) : AttachmentRepository {
    private val table = "flex.${baseResource}_attachment"
    private val parentIdColumn = "${baseResource}_id"

    private val selectColumns =
        "id, $parentIdColumn AS parent_id, object_id, name, content_type, size_bytes, " +
            "lower(record_time_range) AS recorded_at, recorded_by"

    private fun rowMapper(rs: ResultSet) = AttachmentRecord(
        id = rs.getLong("id"),
        parentId = rs.getLong("parent_id"),
        objectId = rs.getString("object_id"),
        name = rs.getString("name"),
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
                    FROM $table
                    WHERE $parentIdColumn = :parentId
                    ORDER BY lower(record_time_range) DESC
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
                    FROM $table
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
    override suspend fun insert(
        parentId: Long,
        objectId: String,
        name: String,
        contentType: String,
        sizeBytes: Long,
    ): Either<RepositoryError, AttachmentRecord> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    INSERT INTO $table ($parentIdColumn, object_id, name, content_type, size_bytes)
                    VALUES (:parentId, :objectId, :name, :contentType, :sizeBytes)
                    RETURNING $selectColumns
                    """,
                    mapOf(
                        "parentId" to parentId,
                        "objectId" to objectId,
                        "name" to name,
                        "contentType" to contentType,
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
                    DELETE FROM $table
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
