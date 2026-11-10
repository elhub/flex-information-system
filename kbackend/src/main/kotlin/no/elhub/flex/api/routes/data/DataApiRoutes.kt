package no.elhub.flex.api.routes.data

import io.ktor.server.application.Application
import io.ktor.server.routing.method
import io.ktor.server.routing.route
import no.elhub.flex.api.postgrest.PostgrestClient
import no.elhub.flex.api.routes.data.generated.GeneratedDataApiRoutes
import no.elhub.flex.api.routes.handlePostgrestRoute
import no.elhub.flex.auth.plugin.authenticatedRouting
import org.koin.ktor.ext.inject

const val DATA_API_MOUNT_PATH = "/api/v1"

private const val DATA_ASSET = "data"

/**
 * Registers the data API routes that are served by PostgREST, as listed by the generated route table
 * and the [DataApiRegistry].
 */
fun Application.dataApiRoutes() {
    val postgrest: PostgrestClient by inject()

    authenticatedRouting {
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
        }
    }
}
