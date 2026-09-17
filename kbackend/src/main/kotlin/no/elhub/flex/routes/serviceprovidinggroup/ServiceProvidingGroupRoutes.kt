package no.elhub.flex.routes.serviceprovidinggroup

import arrow.core.raise.either
import io.ktor.server.application.Application
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.auth.AccessTokenKey
import no.elhub.flex.auth.FlexRole
import no.elhub.flex.auth.Scope
import no.elhub.flex.auth.ScopeVerb
import no.elhub.flex.auth.requireRoles
import no.elhub.flex.auth.requireScope
import no.elhub.flex.auth.toFlexPrincipal
import no.elhub.flex.model.dto.toDtos
import no.elhub.flex.model.error.InternalServerError
import no.elhub.flex.model.error.ParsingError
import no.elhub.flex.serviceprovidinggroup.db.ServiceProvidingGroupRepository
import no.elhub.flex.util.TraceIdUtil.Companion.traceIdOrUnknown
import no.elhub.flex.util.pathParameter
import no.elhub.flex.util.respondJson
import org.koin.ktor.ext.inject

fun Application.serviceProvidingGroupRoutes() {
    routing {
        val repo: ServiceProvidingGroupRepository by inject()
        route("/service_providing_group") {
            route("/{spgId}/controllable_units/applications") {
                requireRoles(FlexRole.SERVICE_PROVIDER, FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR) // / TODO: Which roles?
                requireScope(
                    Scope(ScopeVerb.Read, "data")
                )
                get {
                    either {
                        val spgId = call.pathParameter("spgId")
                            .map { it.toLongOrNull() }
                            .bind()
                            ?: raise(ParsingError("spgId should be an integer"))
                        val principal = call.attributes[AccessTokenKey].toFlexPrincipal()
                        with(principal) {
                            repo.getApplicationStatusForControllableUnits(spgId)
                                .mapLeft { _ -> InternalServerError(traceIdOrUnknown()) }
                                .bind().toDtos()
                        }
                    }.respondJson(call)
                }
            }
        }
    }
}
