package no.elhub.flex.routes.accountingpoint

import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.routing.get
import io.ktor.server.routing.method
import io.ktor.server.routing.patch
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.auth.FlexRole
import no.elhub.flex.auth.Scope
import no.elhub.flex.auth.ScopeVerb
import no.elhub.flex.auth.requireRoles
import no.elhub.flex.auth.requireScope
import org.koin.ktor.ext.inject

fun Application.accountingPointRoutes() {
    routing {
        route("/accounting_point") {
            route("/{accountingPointId}/grid_location") {
                val handler: AccountingPointGridLocationHandler by inject()
                requireRoles(FlexRole.SYSTEM_OPERATOR, FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR)

                method(HttpMethod.Get) {
                    requireScope(Scope(ScopeVerb.Read, "data:accounting_point_grid_location"))
                    handle { handler.read(call) }
                }

                method(HttpMethod.Post) {
                    requireScope(Scope(ScopeVerb.Manage, "data:accounting_point_grid_location"))
                    handle { handler.create(call) }
                }

                method(HttpMethod.Patch) {
                    requireScope(Scope(ScopeVerb.Manage, "data:accounting_point_grid_location"))
                    handle { handler.update(call) }
                }
            }
        }
    }
}
