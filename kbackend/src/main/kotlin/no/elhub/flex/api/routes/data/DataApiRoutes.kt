package no.elhub.flex.api.routes.data

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.routing.method
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.postgrest.PostgrestClient
import no.elhub.flex.api.routes.data.generated.GeneratedDataApiRoutes
import no.elhub.flex.api.routes.handlePostgrestRoute
import no.elhub.flex.api.util.respondError
import org.koin.ktor.ext.inject

const val DATA_API_MOUNT_PATH = "/api/v1"

private const val DATA_ASSET = "data"

/**
 * Registers the data API routes that are served by PostgREST, as listed by the generated route table
 * and the [DataApiRegistry], and a JSON 404 for everything else.
 */
fun Application.dataApiRoutes() {
    val postgrest: PostgrestClient by inject()

    routing {
        route(DATA_API_MOUNT_PATH) {
            for ((apiRoute, variant) in DataApiRegistry.servedByPostgrest(GeneratedDataApiRoutes.routes)) {
                route(apiRoute.path) {
                    method(apiRoute.method) {
                        handle {
                            handlePostgrestRoute(
                                call,
                                postgrest,
                                variant,
                                mountPath = DATA_API_MOUNT_PATH,
                                asset = DATA_ASSET,
                                relations = GeneratedDataApiRoutes.embedRelations,
                            )
                        }
                    }
                }
            }

            route("{...}") {
                handle {
                    val path = call.request.path().removePrefix(DATA_API_MOUNT_PATH)
                    call.respondError(
                        HttpStatusCode.NotFound,
                        ErrorMessage(code = "HTTP404", message = "Not Found: ${call.request.httpMethod.value} $path"),
                    )
                }
            }
        }
    }
}
