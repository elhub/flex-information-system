package no.elhub.flex.auth

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.createRouteScopedPlugin
import io.ktor.server.application.hooks.CallSetup
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import no.elhub.flex.model.dto.generated.models.ErrorMessage

/** Configuration for the [RequireScope] plugin. */
class RequireScopeConfig {
    /** The scope that callers must possess to access the route. */
    var requiredScope: Scope? = null
}

/**
 * Route-scoped plugin that enforces scope-based authorization on the routes it is installed on.
 *
 * Reads the [AccessToken] stored by [FlexAuthentication], parses its scope strings into [Scope]
 * instances, and responds with HTTP 403 if none of the caller's scopes
 * [cover][Scope.covers] the [required scope][RequireScopeConfig.requiredScope].
 *
 * Prefer the [requireScope] extension function over installing this plugin directly.
 *
 * Usage:
 * ```kotlin
 * route("/some-resource") {
 *     requireScope("use:data:some_resource")
 *     post { handler.handle(call) }
 * }
 * ```
 */
val RequireScope = createRouteScopedPlugin("RequireScope", ::RequireScopeConfig) {
    val required = requireNotNull(pluginConfig.requiredScope) {
        "RequireScope plugin must be configured with a requiredScope"
    }

    on(CallSetup) { call ->
        val token = call.attributes[AccessTokenKey]
        val callerScopes = token.scope.mapNotNull { Scope.fromString(it) }

        if (!callerScopes.covers(required)) {
            call.respond(
                HttpStatusCode.Forbidden,
                ErrorMessage(
                    code = "HTTP403",
                    message = InsufficientScopeError(required.toString()).message ?: "Forbidden",
                ),
            )
            return@on
        }
    }
}

/**
 * Installs [RequireScope] on this route, restricting access to callers whose token scopes
 * cover the given [scope] string (e.g. `"use:data:controllable_unit:lookup"`).
 *
 * Usage:
 * ```kotlin
 * route("/lookup") {
 *     requireScope("use:data:controllable_unit:lookup")
 *     post { handler.handle(call) }
 * }
 * ```
 *
 * @throws IllegalArgumentException if [scope] cannot be parsed as a valid [Scope].
 */
fun Route.requireScope(scope: String) {
    val parsed = requireNotNull(Scope.fromString(scope)) {
        "Invalid scope string: $scope"
    }
    install(RequireScope) { requiredScope = parsed }
}
