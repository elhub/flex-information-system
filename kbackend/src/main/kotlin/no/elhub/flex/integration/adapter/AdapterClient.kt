package no.elhub.flex.integration.adapter

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.ktor.client.HttpClient
import io.ktor.client.engine.apache5.Apache5
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.SerializersModule
import no.elhub.flex.integration.adapter.generated.client.AccountingPointClient
import no.elhub.flex.integration.adapter.generated.client.ApiConfiguration
import no.elhub.flex.integration.adapter.generated.client.GridModelClient
import no.elhub.flex.integration.adapter.generated.client.MeteringGridAreaClient
import no.elhub.flex.integration.adapter.generated.client.NetworkResult
import no.elhub.flex.integration.adapter.generated.models.AccountingPoint
import no.elhub.flex.integration.adapter.generated.models.GridModel
import no.elhub.flex.integration.adapter.generated.models.MeteringGridArea
import no.elhub.flex.util.UUIDSerializer
import no.elhub.flex.util.currentTraceContext
import org.koin.core.annotation.Property
import org.koin.core.annotation.Single
import java.util.UUID
import kotlin.time.Instant
import no.elhub.flex.integration.adapter.generated.client.NetworkError as ClientNetworkError

interface AdapterClient {
    suspend fun getAccountingPoint(
        accountingPointId: String,
        validFrom: Instant
    ): Either<AdapterError, AccountingPoint>

    suspend fun getMeteringGridAreas(): Either<AdapterError, List<MeteringGridArea>>

    suspend fun getGridModel(): Either<AdapterError, GridModel>
}

@Single(createdAtStart = true)
class AdapterHttpClient(
    @Property("accounting-point-adapter.base-url") private val baseUrl: String,
    @Property("accounting-point-adapter.api-key") private val apiKey: String
) : AdapterClient {

    private companion object {
        const val REQUEST_TIMEOUT_MILLIS = 6000L

        // token 5s + Nemo 10s
        const val GRID_MODEL_REQUEST_TIMEOUT_MILLIS = 20_000L
    }

    private fun httpClient(requestTimeoutMillis: Long) = HttpClient(Apache5) {
        engine {
            customizeClient {
                useSystemProperties()
            }
        }
        install(HttpTimeout) {
            this.requestTimeoutMillis = requestTimeoutMillis
        }
        install(ContentNegotiation) {
            json(
                Json {
                    serializersModule = SerializersModule {
                        contextual(UUID::class, UUIDSerializer)
                    }
                },
            )
        }
    }

    private val httpClient = httpClient(REQUEST_TIMEOUT_MILLIS)

    private val client = AccountingPointClient(httpClient)
    private val meteringGridAreaClient = MeteringGridAreaClient(httpClient)
    private val gridModelClient = GridModelClient(httpClient(GRID_MODEL_REQUEST_TIMEOUT_MILLIS))

    override suspend fun getAccountingPoint(
        accountingPointId: String,
        validFrom: Instant,
    ): Either<AdapterError, AccountingPoint> {
        val config = ApiConfiguration(
            basePath = baseUrl,
            customHeaders = mapOf(
                "Authorization" to "Bearer $apiKey",
                "traceparent" to currentTraceContext().traceInfo.toString(),
            )
        )
        return when (val result = client.readAccountingPoint(accountingPointId, validFrom, apiConfiguration = config)) {
            is NetworkResult.Success -> result.data.right()

            is NetworkResult.Failure -> when (val error = result.error) {
                is ClientNetworkError.Http -> if (error.statusCode == HttpStatusCode.NotFound.value) {
                    NotFoundError("Accounting point", accountingPointId).left()
                } else {
                    HttpError(error.statusCode, error.statusDescription).left()
                }

                is ClientNetworkError.Network -> NetworkError(error.cause?.message).left()

                is ClientNetworkError.Serialization -> NetworkError(error.cause.message).left()

                is ClientNetworkError.Unknown -> NetworkError(error.cause?.message).left()
            }
        }
    }

    override suspend fun getMeteringGridAreas(): Either<AdapterError, List<MeteringGridArea>> {
        val config = ApiConfiguration(
            basePath = baseUrl,
            customHeaders = mapOf(
                "Authorization" to "Bearer $apiKey",
                "traceparent" to currentTraceContext().traceInfo.toString(),
            )
        )
        return when (val result = meteringGridAreaClient.readMeteringGridAreas(apiConfiguration = config)) {
            is NetworkResult.Success -> result.data.right()

            is NetworkResult.Failure -> when (val error = result.error) {
                is ClientNetworkError.Http -> HttpError(error.statusCode, error.statusDescription).left()
                is ClientNetworkError.Network -> NetworkError(error.cause?.message).left()
                is ClientNetworkError.Serialization -> NetworkError(error.cause.message).left()
                is ClientNetworkError.Unknown -> NetworkError(error.cause?.message).left()
            }
        }
    }

    override suspend fun getGridModel(): Either<AdapterError, GridModel> {
        val config = ApiConfiguration(
            basePath = baseUrl,
            customHeaders = mapOf(
                "Authorization" to "Bearer $apiKey",
                "traceparent" to currentTraceContext().traceInfo.toString(),
            )
        )
        return when (val result = gridModelClient.readGridModel(apiConfiguration = config)) {
            is NetworkResult.Success -> result.data.right()

            is NetworkResult.Failure -> when (val error = result.error) {
                is ClientNetworkError.Http -> HttpError(error.statusCode, error.statusDescription).left()
                is ClientNetworkError.Network -> NetworkError(error.cause?.message).left()
                is ClientNetworkError.Serialization -> NetworkError(error.cause.message).left()
                is ClientNetworkError.Unknown -> NetworkError(error.cause?.message).left()
            }
        }
    }
}
