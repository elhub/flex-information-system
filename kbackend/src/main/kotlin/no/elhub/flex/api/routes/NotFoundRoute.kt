package no.elhub.flex.api.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.util.respondError

/** Registers a JSON 404 for every request that no other route serves. */
fun Application.notFoundRoute() {
    routing {
        route("{...}") {
            handle {
                call.respondError(
                    HttpStatusCode.NotFound,
                    ErrorMessage(code = "HTTP404", message = "Not Found: ${call.request.httpMethod.value} ${call.request.path()}"),
                )
            }
        }
    }
}
