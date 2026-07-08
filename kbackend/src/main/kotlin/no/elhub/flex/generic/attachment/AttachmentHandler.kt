package no.elhub.flex.routes.attachment

import arrow.core.left
import arrow.core.raise.either
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.server.routing.RoutingCall
import io.ktor.utils.io.toByteArray
import no.elhub.flex.auth.AccessTokenKey
import no.elhub.flex.auth.toFlexPrincipal
import no.elhub.flex.generic.attachment.AttachmentRepository
import no.elhub.flex.generic.attachment.AttachmentRepositoryImpl
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.error.InternalServerError
import no.elhub.flex.model.error.ParsingError
import no.elhub.flex.model.error.ResourceNotFoundError
import no.elhub.flex.storage.AttachmentStorageService
import no.elhub.flex.storage.FileContentParser
import no.elhub.flex.storage.FileContentType
import no.elhub.flex.storage.InvalidFileContent
import no.elhub.flex.util.TraceIdUtil.Companion.traceIdOrUnknown
import no.elhub.flex.util.multipart
import no.elhub.flex.util.pathParameter
import no.elhub.flex.util.respondJson
import no.elhub.flex.util.respondRedirect
import java.util.UUID

private val logger = KotlinLogging.logger {}

private const val MAX_MULTIPART_SIZE_BYTES: Long = 20_000_000L

/**
 * Handlers for an attachment resource.
 *
 * @param baseResource the resource the attachments belong to
 * @param attachmentStorageService the service enabling connection to the storage container
 * @param fileContentParser the parser checking validity of the uploaded files
 */
class AttachmentHandler(
    val baseResource: String,
    private val attachmentStorageService: AttachmentStorageService,
    private val fileContentParser: FileContentParser,
) {
    private val repo: AttachmentRepository = AttachmentRepositoryImpl(baseResource)

    suspend fun download(call: RoutingCall) {
        either {
            val principal = call.attributes[AccessTokenKey].toFlexPrincipal()

            val id = call.pathParameter("id")
                .map { it.toLongOrNull() }
                .bind()
                ?: raise(ParsingError("id should be an integer"))

            // get metadata to know object ID
            val record = with(principal) { repo.get(id) }
                .mapLeft { e ->
                    when (e) {
                        is NotFoundError -> ResourceNotFoundError("attachment not found")

                        else -> {
                            logger.error { "Error while retrieving metadata for attachment id=$id: $e" }
                            InternalServerError(traceIdOrUnknown())
                        }
                    }
                }
                .bind()

            // redirect to presigned URL for downloading this object
            attachmentStorageService.presignedDownloadUrl(record.objectId, record.name)
                .mapLeft { e ->
                    logger.error { "Failed to generate presigned URL for attachment id=$id: $e" }
                    InternalServerError(traceIdOrUnknown())
                }
                .map { url ->
                    logger.debug { "Redirecting download for attachment id=$id to: $url" }
                    url
                }
                .bind()
        }.respondRedirect(call, true)
    }

    suspend fun create(call: RoutingCall) {
        either {
            val principal = call.attributes[AccessTokenKey].toFlexPrincipal()

            var parentId: Long? = null
            var fileBytes: ByteArray? = null
            var fileName: String? = null

            call.multipart(MAX_MULTIPART_SIZE_BYTES).bind().forEachPart { part ->
                when {
                    part is PartData.FormItem && part.name == "${baseResource}_id" ->
                        parentId = part.value.toLongOrNull()

                    part is PartData.FileItem && part.name == "file" -> {
                        fileName = part.originalFileName
                        fileBytes = part.provider().toByteArray()
                    }
                }
                part.release()
            }

            if (parentId == null) {
                raise(ParsingError("Missing or invalid form field: ${baseResource}_id"))
            }
            if (fileName == null || fileName?.isEmpty() ?: false) {
                raise(ParsingError("Missing or invalid file name"))
            }
            if (fileBytes == null) {
                raise(ParsingError("Missing file"))
            }

            // validate file content
            val fileContent = fileContentParser.parse(fileBytes)
                .mapLeft { e ->
                    logger.error { "File validation failed for new attachment: $e" }
                    when (e) {
                        is InvalidFileContent ->
                            ParsingError("Invalid file content: ${e.reason}")
                    }
                }
                .bind()

            // upload to storage
            val objectId = UUID.randomUUID().toString()
            attachmentStorageService.upload(objectId, fileName!!, fileContent)
                .mapLeft { e ->
                    logger.error { "Error while uploading $objectId: $e" }
                    InternalServerError(traceIdOrUnknown())
                }
                .bind()

            // insert metadata into DB
            with(principal) {
                repo.insert(
                    parentId!!,
                    objectId,
                    fileName!!,
                    fileContent.contentType.toString(),
                    fileContent.bytes.size.toLong(),
                )
            }
                .map { it.specialise(baseResource) }
                .mapLeft { e ->
                    logger.error { "DB insert failed after upload for objectId=$objectId: $e" }
                    InternalServerError(traceIdOrUnknown())
                }.bind()
        }.respondJson(call, HttpStatusCode.Created)
    }

    suspend fun delete(call: RoutingCall) {
        either {
            val principal = call.attributes[AccessTokenKey].toFlexPrincipal()

            val id = call.pathParameter("id")
                .map { it.toLongOrNull() }
                .bind()
                ?: raise(ParsingError("id should be an integer"))

            // delete DB row and get object ID
            val objectId = with(principal) {
                repo.delete(id)
                    .map { it.objectId }
                    .mapLeft { e ->
                        when (e) {
                            is NotFoundError -> ResourceNotFoundError("attachment not found")

                            else -> {
                                logger.error { "Error while deleting metadata for attachment id=$id: $e" }
                                InternalServerError(traceIdOrUnknown())
                            }
                        }
                    }
                    .bind()
            }

            // try deleting from storage
            // NB: failing here means dead object on the storage container, but it will be garbage collected
            // by a background task when we implement it, so we make the failure silent
            attachmentStorageService.delete(objectId)
                .fold(
                    ifLeft = { e ->
                        logger.warn { "Storage delete failed for attachment id=$id, objectId=$objectId: $e" }
                    },
                    ifRight = { }
                )
        }.fold(
            ifLeft = { e -> e.left().respondJson<Unit>(call) },
            ifRight = { call.response.status(HttpStatusCode.NoContent) }
        )
    }
}
