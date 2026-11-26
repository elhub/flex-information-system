package no.elhub.flex.api.routes.entity

import io.ktor.server.application.Application
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import no.elhub.flex.api.routes.data.DATA_API_MOUNT_PATH
import no.elhub.flex.auth.plugin.authenticatedRouting
import no.elhub.flex.auth.plugin.requireScope
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import org.koin.ktor.ext.inject

/** Registers all `entity` routes on [Application]. */
fun Application.entityRoutes() {
    authenticatedRouting {
        val lookup: EntityLookup by inject()
        route(DATA_API_MOUNT_PATH) {
            route("/entity/lookup") {
                requireScope(Scope(ScopeVerb.Use, "data:entity:lookup"))
                post { lookup.handle(call) }
            }
        }
    }
}
