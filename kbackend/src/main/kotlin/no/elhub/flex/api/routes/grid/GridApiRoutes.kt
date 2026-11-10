package no.elhub.flex.api.routes.grid

import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.routing.method
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.postgrest.GridReadVariant
import no.elhub.flex.api.postgrest.GridSubstationListVariant
import no.elhub.flex.api.postgrest.PostgrestClient
import no.elhub.flex.api.postgrest.PostgrestRouteVariant
import no.elhub.flex.api.routes.ApiRoute
import no.elhub.flex.api.routes.grid.generated.GeneratedGridApiRoutes
import no.elhub.flex.api.routes.handlePostgrestRoute
import no.elhub.flex.api.util.respondError
import org.koin.ktor.ext.inject

const val GRID_API_MOUNT_PATH = "/grid/v0"

private const val GRID_ASSET = "grid"

/** The documentation is served by [gridApiDocsRoutes]. */
private val documentationRoutes = setOf(ApiRoute(HttpMethod.Get, "/openapi.json"))

private val variants: Map<ApiRoute, PostgrestRouteVariant> = mapOf(
    ApiRoute(HttpMethod.Get, "/substation") to GridSubstationListVariant,
)

/** The routes of the grid API, all served by PostgREST, with their variants. */
fun servedGridRoutes(routes: List<ApiRoute>): List<Pair<ApiRoute, PostgrestRouteVariant>> =
    routes.filter { it !in documentationRoutes }.map { it to (variants[it] ?: GridReadVariant()) }

/** Registers the grid API routes, as listed by the generated route table. */
fun Application.gridApiRoutes() {
    val postgrest: PostgrestClient by inject()

    routing {
        route(GRID_API_MOUNT_PATH) {
            for ((apiRoute, variant) in servedGridRoutes(GeneratedGridApiRoutes.routes)) {
                route(apiRoute.path) {
                    method(apiRoute.method) {
                        handle {
                            handlePostgrestRoute(
                                call,
                                postgrest,
                                variant,
                                mountPath = GRID_API_MOUNT_PATH,
                                asset = GRID_ASSET,
                                relations = GeneratedGridApiRoutes.embedRelations,
                            )
                        }
                    }
                }
            }
        }
    }
}
