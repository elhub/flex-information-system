package no.elhub.flex.integration.accountingpointadapter.generated.client

import io.ktor.client.HttpClient
import io.ktor.client.call.NoTransformationFoundException
import io.ktor.client.call.body
import io.ktor.client.plugins.ResponseException
import io.ktor.client.request.`get`
import io.ktor.client.request.`header`
import io.ktor.client.request.headers
import io.ktor.client.statement.bodyAsText
import io.ktor.http.isSuccess
import io.ktor.serialization.ContentConvertException
import java.io.IOException
import kotlin.String
import kotlin.time.Instant
import kotlinx.coroutines.CancellationException
import no.elhub.flex.integration.accountingpointadapter.generated.models.AccountingPoint

public class AccountingPointClient(
  private val httpClient: HttpClient,
) {
  /**
   * Read accounting point data by GSRN
   * Retrieves accounting point information from the
   * datahub for a given GSRN (metering point ID).
   *
   *
   * Parameters:
   * 	 @param gsrn Global Service Relation Number (18-digit GSRN)
   * 	 @param validFrom Filter results to include only data valid from this date/time. ISO 8601
   * format.
   * 	 @param validTo Filter results to include only data valid up to this date/time. ISO 8601
   * format.
   *
   * Returns:
   * 	[NetworkResult.Success] with
   * [no.elhub.flex.integration.accountingpointadapter.generated.models.AccountingPoint] if the request
   * was successful.
   * 	[NetworkResult.Failure] with a [NetworkError] if the request failed.
   */
  public suspend fun readAccountingPoint(
    gsrn: String,
    validFrom: Instant,
    validTo: Instant? = null,
    apiConfiguration: ApiConfiguration = ApiConfiguration(),
  ): NetworkResult<AccountingPoint> {
    val basePath = apiConfiguration.basePath.trimEnd('/')
    val url = buildString {
      append(basePath)
      append("""/accounting_point/${gsrn}""")
      val params = buildList {
        add("valid_from=${validFrom}")
        validTo?.let { add("valid_to=${it}") }
      }
      if (params.isNotEmpty()) append("?").append(params.joinToString("&"))
    }

    return try {
      val response = httpClient.`get`(url) {
        `header`("Accept", "application/json")
        headers {
          apiConfiguration.customHeaders.forEach { (name, value) ->
            remove(name)
            append(name, value)
          }
        }
      }

      if (response.status.isSuccess()) {
        NetworkResult.Success(response.body())
      } else {
        val errorBody = response.bodyAsText().ifBlank { null }
        NetworkResult.Failure(NetworkError.Http(statusCode = response.status.value,
            statusDescription = response.status.description, body = errorBody))
      }
    } catch (e: ResponseException) {
      val status = e.response.status
      val body = runCatching { e.response.bodyAsText() }.getOrNull()?.ifBlank { null }
      NetworkResult.Failure(NetworkError.Http(status.value, status.description, body))
    } catch (e: IOException) {
      NetworkResult.Failure(NetworkError.Network(e))
    } catch (e: ContentConvertException) {
      NetworkResult.Failure(NetworkError.Serialization(e))
    } catch (e: NoTransformationFoundException) {
      NetworkResult.Failure(NetworkError.Serialization(e))
    } catch (e: CancellationException) {
      throw e
    } catch (e: Exception) {
      NetworkResult.Failure(NetworkError.Unknown(e))
    }
  }
}
