package no.elhub.flex.api.productapplication

import arrow.core.Either
import arrow.core.raise.either
import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receiveText
import io.ktor.server.routing.RoutingCall
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import no.elhub.flex.api.util.pathParameter
import no.elhub.flex.auth.plugin.accessToken
import no.elhub.flex.auth.token.toFlexPrincipal
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.http.AppError
import no.elhub.flex.shared.http.ParsingError
import no.elhub.flex.shared.http.ResourceNotFoundError
import no.elhub.flex.shared.http.respondJson
import java.sql.Connection

/**
 * `POST` and `PATCH` of service providing group product applications.
 *
 * The product-specific details are validated here, against the typed variants of the API. The rows are written
 * through the `api` view with the role of the caller, so that row-level security, field-level grants and the other
 * rules of the database apply as for any other resource.
 */
class ProductApplicationHandler {
    suspend fun create(call: RoutingCall) {
        val principal = call.accessToken.toFlexPrincipal()
        val text = call.receiveText()
        with(principal) {
            flexTransaction { conn ->
                either {
                    val body = parseBody(text).bind()
                    checkBodyShape(body, create = true).bind()
                    checkSingleProductType(body).bind()
                    val kind = kindOf(conn, effectiveProductTypeIds(body, null)).bind()
                    val columns = planWrite(body, null, kind).bind()
                    ProductApplicationRepository.insert(conn, columns).bind()
                }
            }
        }.respondJson(call, HttpStatusCode.Created)
    }

    suspend fun update(call: RoutingCall) {
        val principal = call.accessToken.toFlexPrincipal()
        val text = call.receiveText()
        with(principal) {
            flexTransaction { conn ->
                either {
                    val id = call.pathParameter("id").map { it.toLongOrNull() }.bind()
                        ?: raise(ParsingError("id should be an integer"))
                    val body = parseBody(text).bind()
                    checkBodyShape(body, create = false).bind()
                    checkSingleProductType(body).bind()

                    val current = ProductApplicationRepository.read(conn, id).bind()
                        ?: raise(ResourceNotFoundError("User cannot update this resource"))

                    val kind = kindOf(conn, effectiveProductTypeIds(body, current)).bind()
                    val columns = planWrite(body, current, kind).bind()

                    if (columns.isEmpty()) {
                        current
                    } else {
                        if (!ProductApplicationRepository.update(conn, id, columns).bind()) {
                            raise(ResourceNotFoundError("User cannot update this resource"))
                        }
                        ProductApplicationRepository.read(conn, id).bind() ?: raise(ResourceNotFoundError("User cannot update this resource"))
                    }
                }
            }
        }.respondJson(call)
    }

    private fun parseBody(text: String): Either<AppError, JsonObject> =
        Either.catch { strictJson.parseToJsonElement(text).jsonObject }
            .mapLeft { ParsingError("Could not parse request body: it must be a JSON object") }

    private fun kindOf(conn: Connection, productTypeIds: List<Long>): Either<AppError, String?> =
        productTypeIds.singleOrNull()
            ?.let { ProductApplicationRepository.productTypeKind(conn, it) }
            ?: Either.Right(null)
}
