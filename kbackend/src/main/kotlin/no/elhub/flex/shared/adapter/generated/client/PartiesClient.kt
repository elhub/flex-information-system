package no.elhub.flex.shared.adapter.generated.client

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
import kotlin.collections.List
import kotlinx.coroutines.CancellationException
import kotlinx.io.IOException
import no.elhub.flex.shared.adapter.generated.models.Party

public class PartiesClient(
  private val httpClient: HttpClient,
) {
  /**
   * Read party data
   * Retrieves all parties from the external party register, restricted to the party types relevant
   * for the flexibility information system. An organisation acting as several types of party is listed
   * once per type.
   *
   *
   * Returns:
   * 	[NetworkResult.Success] with
   * [kotlin.collections.List<no.elhub.flex.shared.adapter.generated.models.Party>] if the request was
   * successful.
   * 	[NetworkResult.Failure] with a [NetworkError] if the request failed.
   */
  public suspend fun readParties(apiConfiguration: ApiConfiguration = ApiConfiguration()):
      NetworkResult<List<Party>> {
    val basePath = apiConfiguration.basePath.trimEnd('/')
    val url = basePath + """/parties"""

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
