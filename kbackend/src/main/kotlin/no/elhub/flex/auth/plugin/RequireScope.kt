package no.elhub.flex.auth.plugin

import io.ktor.server.application.createRouteScopedPlugin
import io.ktor.server.auth.AuthenticationChecked
import io.ktor.server.routing.Route
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.covers

/** Configuration for the [RequireScope] plugin. */
class RequireScopeConfig {
    /** The scope that callers must possess to access the route. */
    var requiredScope: Scope? = null
}

/** Plugin enforcing scope-based authorization on the routes it is installed on. */
val RequireScope = createRouteScopedPlugin("RequireScope", ::RequireScopeConfig) {
    val requiredScope = requireNotNull(pluginConfig.requiredScope) {
        "RequireScope plugin must be configured with a requiredScope"
    }

    on(AuthenticationChecked) { call ->
        val tokenScopes = call.accessToken.scope

        if (!tokenScopes.covers(requiredScope)) {
            call.respondInsufficientScope(requiredScope)
        }
    }
}

/** Installs [RequireScope] on this route, restricting access to callers whose token scopes cover the given [scope]. */
fun Route.requireScope(scope: Scope) {
    install(RequireScope) { requiredScope = scope }
}
