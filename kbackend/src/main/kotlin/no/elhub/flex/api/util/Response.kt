package no.elhub.flex.api.util

import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respondText
import kotlinx.serialization.json.Json
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage

private val errorJson = Json { explicitNulls = false }

/** Responds with [error] as JSON. */
suspend fun ApplicationCall.respondError(status: HttpStatusCode, error: ErrorMessage) {
    respondText(errorJson.encodeToString(ErrorMessage.serializer(), error), ContentType.Application.Json, status)
}
