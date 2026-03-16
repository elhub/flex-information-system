package no.elhub.flex.integration.accountingpointadapter

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import no.elhub.flex.integration.accountingpointadapter.generated.client.AccountingPointClient
import no.elhub.flex.integration.accountingpointadapter.generated.client.ApiConfiguration
import no.elhub.flex.integration.accountingpointadapter.generated.client.NetworkResult
import no.elhub.flex.integration.accountingpointadapter.generated.models.AccountingPoint
import org.koin.core.annotation.Property
import org.koin.core.annotation.Single
import no.elhub.flex.integration.accountingpointadapter.generated.client.NetworkError as ClientNetworkError

interface AccountingPointAdapterService {
    suspend fun getAccountingPoint(accountingPointId: String): Either<AccountingPointAdapterError, AccountingPoint>
}

@Single(createdAtStart = true)
class AccountingPointAdapterHttpService(
    @Property("accounting-point-adapter.base-url") private val baseUrl: String
) : AccountingPointAdapterService {

    private companion object {
        const val REQUEST_TIMEOUT_MILLIS = 5000L
    }

    private val client =
        AccountingPointClient(
            HttpClient(CIO) {
                install(HttpTimeout) {
                    requestTimeoutMillis = REQUEST_TIMEOUT_MILLIS
                }
                install(ContentNegotiation) {
                    json(Json.Default)
                }
            },
        )

    private val config = ApiConfiguration(basePath = baseUrl)

    override suspend fun getAccountingPoint(accountingPointId: String): Either<AccountingPointAdapterError, AccountingPoint> =
        when (val result = client.readAccountingPoint(accountingPointId, config)) {
            is NetworkResult.Success -> result.data.right()

            is NetworkResult.Failure -> when (val error = result.error) {
                is ClientNetworkError.Http -> if (error.statusCode == HttpStatusCode.NotFound.value) {
                    NotFoundError(accountingPointId).left()
                } else {
                    HttpError(error.statusCode, error.statusDescription).left()
                }

                is ClientNetworkError.Network -> NetworkError(error.cause?.message).left()

                is ClientNetworkError.Serialization -> NetworkError(error.cause.message).left()

                is ClientNetworkError.Unknown -> NetworkError(error.cause?.message).left()
            }
        }
}
