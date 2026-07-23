package no.elhub.flex.attachment

import arrow.core.Either
import arrow.core.flatMap
import arrow.core.left
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.MultiPartData
import io.ktor.http.content.PartData
import io.ktor.server.routing.RoutingCall
import io.ktor.utils.io.toByteArray
import no.elhub.flex.auth.AccessTokenKey
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.auth.FlexRole
import no.elhub.flex.auth.toFlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.error.AppError
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
        }.respondRedirect(call, false)
    }

    suspend fun create(call: RoutingCall) {
        either {
            val principal = call.attributes[AccessTokenKey].toFlexPrincipal()

            // extract information from multipart body
            val createBody =
                call.multipart(MAX_MULTIPART_SIZE_BYTES)
                    .flatMap { with(principal) { CreateBody.parse(it, baseResource, repo) } }
                    .bind()

            if (createBody.contentType != null && createBody.extensionContentType != null && createBody.contentType != createBody.extensionContentType) {
                raise(ParsingError("Content type ${createBody.contentType} does not match file extension for '${createBody.filename.rawValue}'"))
            }

            // validate file content
            val fileContent = FileContent.parse(createBody.contentType ?: createBody.extensionContentType, createBody.fileBytes)
                .mapLeft { e ->
                    logger.error { "File validation failed for new attachment: $e" }
                    when (e) {
                        is InvalidFileContent ->
                            ParsingError("Invalid file content: ${e.reason}")
                    }
                }
                .bind()

            // insert metadata into DB and upload to storage (atomically)
            val objectId = UUID.randomUUID().toString()
            with(principal) {
                flexTransaction {
                    either {
                        val metadata = repo.insert(
                            createBody.baseResourceId,
                            objectId,
                            createBody.filename,
                            fileContent.contentType,
                            fileContent.bytes.size.toLong(),
                        )
                            .map { it.specialise(baseResource) }
                            .mapLeft { e ->
                                logger.error { "DB metadata insert failed for objectId=$objectId: $e" }
                                InternalServerError(traceIdOrUnknown())
                            }.bind()

                        attachmentStorageService.upload(objectId, createBody.filename, fileContent)
                            .mapLeft { e ->
                                logger.error { "Error while uploading $objectId: $e" }
                                InternalServerError(traceIdOrUnknown())
                            }
                            .bind()

                        metadata
                    }
                }
            }
        }.respondJson(call, HttpStatusCode.Created)
    }

    @ConsistentCopyVisibility
    private data class CreateBody private constructor(
        val baseResourceId: Long,
        val contentType: FileContentType?,
        val extensionContentType: FileContentType?,
        val fileBytes: ByteArray,
        val filename: AttachmentFilename
    ) {
        companion object {
            context(principal: FlexPrincipal)
            suspend fun parse(body: MultiPartData, baseResource: String, repo: AttachmentRepository): Either<AppError, CreateBody> =
                either {
                    // base resource ID part expected first, allowing an authorisation check before file parsing
                    val baseResourceIdPart = Either.catch { body.readPart() }
                        .mapLeft { e ->
                            when (e) {
                                is IOException -> MultipartError()

                                else -> {
                                    logger.error { "Unexpected error reading multipart parent ID part: $e" }
                                    InternalServerError(traceIdOrUnknown())
                                }
                            }
                        }.bind()
                    if (baseResourceIdPart == null || baseResourceIdPart !is PartData.FormItem || baseResourceIdPart.name != "${baseResource}_id") {
                        baseResourceIdPart?.release()
                        raise(ParsingError("Expected ${baseResource}_id as first multipart field"))
                    }
                    val baseResourceId = baseResourceIdPart.value.toLongOrNull()
                    baseResourceIdPart.release()
                    if (baseResourceId == null) raise(ParsingError("Invalid ${baseResource}_id"))

                    // authorisation check
                    val canEdit =
                        if (principal.role == FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR.roleName) {
                            true
                        } else {
                            with(principal) { repo.canEdit(baseResourceId) }
                                .mapLeft { e ->
                                    logger.error { "Failed authorisation check on attachment for baseResourceId=$baseResourceId: $e" }
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
                    if (fileBytes.size.toLong() > MAX_MULTIPART_SIZE_BYTES) {
                        filePart.release()
                        raise(ParsingError("File exceeds maximum size of $MAX_MULTIPART_SIZE_BYTES bytes"))
                    }
                    filePart.release()
                    CreateBody(baseResourceId, contentType, extensionContentType, fileBytes, filenameSanitised)
                }
        }
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
