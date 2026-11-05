package no.elhub.flex.api.routes.entity

import io.ktor.server.application.Application
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.api.auth.Scope
import no.elhub.flex.api.auth.ScopeVerb
import no.elhub.flex.api.auth.requireScope
import org.koin.ktor.ext.inject

/** Registers all `entity` routes on [Application]. */
fun Application.entityRoutes() {
    routing {
        val lookup: EntityLookup by inject()
        route("/entity/lookup") {
            requireScope(Scope(ScopeVerb.Use, "data:entity:lookup"))
            post { lookup.handle(call) }
        }
    }
}
