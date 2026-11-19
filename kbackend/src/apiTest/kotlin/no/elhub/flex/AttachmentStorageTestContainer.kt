package no.elhub.flex

import com.adobe.testing.s3mock.testcontainers.S3MockContainer

const val ATTACHMENT_BUCKET = "flex-attachments"

/** Shared S3Mock container that stores the attachments, as `s3mock` in `docker-compose.yml` does. */
object AttachmentStorageTestContainer {

    private val container = S3MockContainer("5.2.3").withInitialBuckets(ATTACHMENT_BUCKET)

    init {
        container.start()
    }

    val endpoint: String
        get() = container.httpEndpoint
}
