package no.elhub.flex.api.routes.productapplication

import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.routing.method
import io.ktor.server.routing.route
import no.elhub.flex.api.productapplication.ProductApplicationHandler
import no.elhub.flex.api.routes.data.DATA_API_MOUNT_PATH
import no.elhub.flex.auth.plugin.authenticatedRouting
import no.elhub.flex.auth.plugin.requireScope
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb

private const val RESOURCE = "service_providing_group_product_application"

/** Registers the routes that write service providing group product applications. */
fun Application.productApplicationRoutes() {
    authenticatedRouting {
        val handler = ProductApplicationHandler()

        route(DATA_API_MOUNT_PATH) {
            route("/$RESOURCE") {
                method(HttpMethod.Post) {
                    requireScope(Scope(ScopeVerb.Manage, "data:$RESOURCE"))
                    handle { handler.create(call) }
                }
            }
            route("/$RESOURCE/{id}") {
                method(HttpMethod.Patch) {
                    requireScope(Scope(ScopeVerb.Manage, "data:$RESOURCE"))
                    handle { handler.update(call) }
                }
            }
        }
    }
}
