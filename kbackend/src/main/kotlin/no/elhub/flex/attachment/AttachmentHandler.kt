package no.elhub.flex.attachment

import arrow.core.Either
import arrow.core.left
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.PartData
import io.ktor.server.routing.RoutingCall
import io.ktor.utils.io.toByteArray
import no.elhub.flex.auth.AccessTokenKey
import no.elhub.flex.auth.FlexRole
import no.elhub.flex.auth.toFlexPrincipal
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.error.ForbiddenError
import no.elhub.flex.model.error.InternalServerError
import no.elhub.flex.model.error.MultipartError
import no.elhub.flex.model.error.ParsingError
import no.elhub.flex.model.error.ResourceNotFoundError
import no.elhub.flex.util.FileContent
import no.elhub.flex.util.FileContentType
import no.elhub.flex.util.InvalidFileContent
import no.elhub.flex.util.TraceIdUtil.Companion.traceIdOrUnknown
import no.elhub.flex.util.multipart
import no.elhub.flex.util.pathParameter
import no.elhub.flex.util.respondJson
import no.elhub.flex.util.respondRedirect
import java.io.IOException
import java.util.UUID

private val logger = KotlinLogging.logger {}

private const val MAX_MULTIPART_SIZE_BYTES: Long = 20_000_000L

/**
 * Handlers for an attachment resource.
 *
 * @param baseResource the resource the attachments belong to
 * @param attachmentStorageService the service enabling connection to the storage container
 */
class AttachmentHandler(
    val baseResource: String,
    private val attachmentStorageService: AttachmentStorageService,
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

            val filename = AttachmentFilename.parse(record.filenameSanitised)
                .mapLeft { e ->
                    logger.error { "Invalid sanitised filename in DB for attachment id=$id: $e" }
                    InternalServerError(traceIdOrUnknown())
                }
                .bind()

            // redirect to presigned URL for downloading this object
            attachmentStorageService.presignedDownloadUrl(record.objectId, filename)
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

            val body = call.multipart(MAX_MULTIPART_SIZE_BYTES).bind()

            // parent ID part expected first, allowing to check authorisation before the file bytes.
            // readPart() reads lazily, so the size limit IOException can surface here.
            val parentIdPart = Either.catch { body.readPart() }
                .mapLeft { e ->
                    when (e) {
                        is IOException -> MultipartError()

                        else -> {
                            logger.error { "Unexpected error reading multipart parent ID part: $e" }
                            InternalServerError(traceIdOrUnknown())
                        }
                    }
                }.bind()
            if (parentIdPart == null || parentIdPart !is PartData.FormItem || parentIdPart.name != "${baseResource}_id") {
                parentIdPart?.release()
                raise(ParsingError("Expected ${baseResource}_id as first multipart field"))
            }
            val parentId = parentIdPart.value.toLongOrNull()
            parentIdPart.release()
            if (parentId == null) raise(ParsingError("Invalid ${baseResource}_id"))

            // authorisation check
            val canEdit =
                if (principal.role == FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR.roleName) {
                    true
                } else {
                    with(principal) { repo.canEdit(parentId) }
                        .mapLeft { e ->
                            logger.error { "Failed authorisation check on attachment for parentId=$parentId: $e" }
                            InternalServerError(traceIdOrUnknown())
                        }.bind()
                }
            if (!canEdit) {
                raise(ForbiddenError("User cannot upload attachment to this resource"))
            }

            // now file part
            val filePart = Either.catch { body.readPart() }
                .mapLeft { e ->
                    when (e) {
                        is IOException -> MultipartError()

                        else -> {
                            logger.error { "Unexpected error reading multipart file part: $e" }
                            InternalServerError(traceIdOrUnknown())
                        }
                    }
                }.bind()
            if (filePart == null || filePart !is PartData.FileItem || filePart.name != "file") {
                filePart?.release()
                raise(ParsingError("Expected file as second multipart field"))
            }
            val filename = filePart.originalFileName
            if (filename == null) {
                filePart.release()
                raise(ParsingError("Missing file name"))
            }
            val extensionContentType = FileContentType.fromFilename(filename)
            val filenameSanitised = AttachmentFilename.parse(filename)
                .onLeft { filePart.release() }
                .bind()
            val contentType = filePart.contentType?.let { FileContentType.fromString(it.toString()) }
            // read the full file body, this is where the size limit fires
            val fileBytes = Either.catch { filePart.provider().toByteArray() }
                .mapLeft { e ->
                    filePart.release()
                    when (e) {
                        is IOException -> MultipartError()

                        else -> {
                            logger.error { "Unexpected error reading file bytes: $e" }
                            InternalServerError(traceIdOrUnknown())
                        }
                    }
                }.bind()
            filePart.release()

            if (contentType != null && extensionContentType != null && contentType != extensionContentType) {
                raise(ParsingError("Content type $contentType does not match file extension for '$filename'"))
            }

            // validate file content
            val fileContent = FileContent.parse(contentType ?: extensionContentType, fileBytes)
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
            attachmentStorageService.upload(objectId, filenameSanitised, fileContent)
                .mapLeft { e ->
                    logger.error { "Error while uploading $objectId: $e" }
                    InternalServerError(traceIdOrUnknown())
                }
                .bind()

            // insert metadata into DB
            with(principal) {
                repo.insert(
                    parentId,
                    objectId,
                    filename,
                    filenameSanitised,
                    fileContent.contentType,
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

            with(principal) {
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

            // NB: no need to delete from the storage: the object will remain in the bucket because we keep history,
            // and will be garbage collected by a background task if/when we implement it
        }.fold(
            ifLeft = { e -> e.left().respondJson<Unit>(call) },
            ifRight = { call.response.status(HttpStatusCode.NoContent) }
        )
    }
}
