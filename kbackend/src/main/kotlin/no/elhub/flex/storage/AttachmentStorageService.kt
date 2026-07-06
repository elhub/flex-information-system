package no.elhub.flex.storage

import arrow.core.Either
import aws.sdk.kotlin.services.s3.S3Client
import aws.sdk.kotlin.services.s3.deleteObject
import aws.sdk.kotlin.services.s3.model.NoSuchKey
import aws.sdk.kotlin.services.s3.presigners.presignGetObject
import aws.sdk.kotlin.services.s3.putObject
import aws.smithy.kotlin.runtime.content.ByteStream
import aws.smithy.kotlin.runtime.net.url.Url
import io.github.oshai.kotlinlogging.KotlinLogging
import org.koin.core.annotation.Property
import org.koin.core.annotation.Single
import kotlin.time.Duration.Companion.minutes

/** Errors that can occur when interacting with object storage. */
sealed class StorageError {
    data class UploadFailed(val reason: String) : StorageError()
    data class DeleteFailed(val reason: String) : StorageError()
    data class PresignFailed(val reason: String) : StorageError()
    data class ObjectNotFound(val objectId: String) : StorageError()
}

/** Abstraction over an object storage backend (S3-compatible or otherwise). */
interface AttachmentStorageService {
    /** Upload [content] under the key [objectId] and filename [fileName] in the configured bucket. */
    suspend fun upload(
        objectId: String,
        fileName: String,
        content: FileContent,
    ): Either<StorageError, Unit>

    /**
     * Generate a pre-signed URL that allows the bearer to download [objectId] directly from storage.
     *
     * The URL is only valid for a short time. The [fileName] is set as the
     * `Content-Disposition: attachment; filename=...` header on the storage response so that browsers
     * suggest a sensible filename when saving.
     */
    suspend fun presignedDownloadUrl(
        objectId: String,
        fileName: String,
    ): Either<StorageError, String>

    /** Delete the object identified by [objectId] from storage. */
    suspend fun delete(objectId: String): Either<StorageError, Unit>
}

private val logger = KotlinLogging.logger {}

/**
 * S3-backed implementation of [AttachmentStorageService].
 *
 * Two endpoints are configured:
 * - [internalEndpoint]: used for actual operations (putObject, deleteObject) from within
 *   the kbackend container where the S3 service is reachable by its Docker service name.
 * - [publicEndpoint]: used only when building pre-signed download URLs, since those URLs
 *   are returned to the browser which must be able to resolve the host directly.
 */
@Single(createdAtStart = true)
class S3AttachmentStorageService(
    @Property("attachment-storage.bucket") private val bucket: String,
    @Property("attachment-storage.internal-endpoint") private val internalEndpoint: String,
    @Property("attachment-storage.public-endpoint") private val publicEndpoint: String,
    @Property("attachment-storage.region") private val region: String = "us-east-1",
    @Property("attachment-storage.access-key") private val accessKey: String,
    @Property("attachment-storage.secret-key") private val secretKey: String,
) : AttachmentStorageService {

    private fun buildClient(endpoint: String): S3Client =
        S3Client {
            this.region = this@S3AttachmentStorageService.region
            endpointUrl = Url.parse(endpoint)
            forcePathStyle = true // required for S3Mock and path-style-only compatible endpoints
            credentialsProvider = aws.sdk.kotlin.runtime.auth.credentials.StaticCredentialsProvider {
                this.accessKeyId = this@S3AttachmentStorageService.accessKey
                this.secretAccessKey = this@S3AttachmentStorageService.secretKey
            }
        }

    override suspend fun upload(
        objectId: String,
        fileName: String,
        content: FileContent,
    ): Either<StorageError, Unit> =
        Either.catch {
            buildClient(internalEndpoint).use { client ->
                client.putObject {
                    bucket = this@S3AttachmentStorageService.bucket
                    key = objectId
                    body = ByteStream.fromBytes(content.bytes)
                    contentType = content.contentType.toString()
                    contentDisposition = "attachment; filename=\"${fileName}\""
                }
            }
        }.mapLeft { e ->
            logger.error(e) { "Failed to upload object $objectId to S3" }
            StorageError.UploadFailed(e.message ?: "unknown error")
        }.map { }

    override suspend fun presignedDownloadUrl(
        objectId: String,
        fileName: String,
    ): Either<StorageError, String> =
        Either.catch {
            // Presigning must use the PUBLIC endpoint so the generated URL is reachable by the browser.
            buildClient(publicEndpoint).use { client ->
                val presigner = client.presignGetObject(
                    input = aws.sdk.kotlin.services.s3.model.GetObjectRequest {
                        bucket = this@S3AttachmentStorageService.bucket
                        key = objectId
                        responseContentDisposition = "attachment; filename=\"$fileName\""
                    },
                    duration = 5.minutes,
                )
                presigner.url.toString()
            }
        }.mapLeft { e ->
            logger.error(e) { "Failed to presign download URL for object $objectId" }
            StorageError.PresignFailed(e.message ?: "unknown error")
        }

    override suspend fun delete(objectId: String): Either<StorageError, Unit> =
        Either.catch {
            buildClient(internalEndpoint).use { client ->
                client.deleteObject {
                    bucket = this@S3AttachmentStorageService.bucket
                    key = objectId
                }
            }
        }.mapLeft { e ->
            if (e is NoSuchKey) {
                logger.warn { "Tried to delete object $objectId but it does not exist" }
                StorageError.ObjectNotFound(objectId)
            } else {
                logger.error(e) { "Failed to delete object $objectId from S3" }
                StorageError.DeleteFailed(e.message ?: "unknown error")
            }
        }.map { }
}
