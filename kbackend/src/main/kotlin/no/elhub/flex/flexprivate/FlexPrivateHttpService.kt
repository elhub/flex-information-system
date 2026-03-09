package no.elhub.flex.flexprivate

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

private val logger = KotlinLogging.logger {}

// ---- JSON models for the FlexPrivate (Metering Point Datahub) response ----

@Serializable
private data class MpdResponse(val data: List<MpdData> = emptyList())

@Serializable
private data class MpdData(
    val attributes: MpdAttributes,
    val relationships: MpdRelationships,
)

@Serializable
private data class MpdAttributes(val status: String)

@Serializable
private data class MpdRelationships(
    @SerialName("grid-area") val gridArea: MpdReference,
)

@Serializable
private data class MpdReference(val data: MpdRefData)

@Serializable
private data class MpdRefData(val id: String)

// ---- Service implementation ----

/**
 * HTTP implementation of [FlexPrivateService] that calls the FlexPrivate / Metering Point Datahub.
 *
 * When [baseUrl] is blank the service returns a [Left] error for every request,
 * signalling that no datahub is configured (matching the Go backend nil-service check).
 */
class FlexPrivateHttpService(private val baseUrl: String) : FlexPrivateService {

    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }

    override suspend fun fetchMeteringGridArea(accountingPointBusinessId: String): Either<String, String> {
        if (baseUrl.isBlank()) {
            logger.debug { "FlexPrivate URL not configured" }
            return "FlexPrivate URL not configured".left()
        }

        return runCatching {
            val response = client.get("$baseUrl/metering-points/$accountingPointBusinessId")

            if (!response.status.isSuccess()) {
                return "datahub returned HTTP ${response.status.value}".left()
            }

            val body = response.bodyAsText()
            val parsed = Json { ignoreUnknownKeys = true }.decodeFromString<MpdResponse>(body)

            if (parsed.data.size != 1) {
                return "expected exactly one metering point entry, got ${parsed.data.size}".left()
            }

            val entry = parsed.data[0]
            if (entry.attributes.status != "Active") {
                return "metering point is inactive".left()
            }

            entry.relationships.gridArea.data.id.right()
        }.getOrElse { e ->
            logger.error { "FlexPrivate request failed: ${e.message}" }
            "could not contact FlexPrivate: ${e.message}".left()
        }
    }
}
