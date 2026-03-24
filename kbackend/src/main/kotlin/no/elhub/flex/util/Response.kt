package no.elhub.flex.util

import arrow.core.Either
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respondText
import kotlinx.serialization.json.Json
import no.elhub.flex.model.dto.generated.models.ErrorMessage
import no.elhub.flex.model.error.AppError

/**
 * Extension function to respond with a JSON body from either an error or a successful serializable value.
 *
 * @receiver the result of an operation that can fail, standard in our typed handlers
 * @param T the type of the successful value, which must be serializable to JSON
 * @param call the Ktor application call to respond to.
 * @param status the HTTP status code to use for successful responses
 */
suspend inline fun <reified T> Either<AppError, T>.respondJson(
    call: ApplicationCall,
    status: HttpStatusCode = HttpStatusCode.OK,
) {
    this.fold(
        { error ->
            call.respondText(
                Json.encodeToString(
                    ErrorMessage(
                        code = "HTTP${error.code.value}",
                        message = error.message,
                    ),
                ),
                ContentType.Application.Json,
                error.code,
            )
        },
        { value ->
            call.respondText(
                Json.encodeToString(value),
                ContentType.Application.Json,
                status,
            )
        },
    )
}
