package no.elhub.flex.auth

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.createRouteScopedPlugin
import io.ktor.server.application.hooks.CallSetup
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import no.elhub.flex.model.dto.generated.models.ErrorMessage

/** Configuration for the [RequireRole] plugin. */
class RequireRoleConfig {
    /** The set of roles permitted to access the route. */
    var allowedRoles: Set<FlexRole> = emptySet()
}

/**
 * Route-scoped plugin that enforces role-based authorization on the routes it is installed on.
 *
 * Reads the [AccessToken] stored by [FlexAuthentication] and responds with HTTP 403 if the
 * caller's role is not in [RequireRoleConfig.allowedRoles], stopping further pipeline execution.
 *
 * Prefer the [requireRoles] extension function over installing this plugin directly.
 *
 * Usage:
 * ```kotlin
 * route("/some-resource") {
 *     requireRoles(FlexRole.SERVICE_PROVIDER)
 *     post { handler.handle(call) }
 * }
 * ```
 */
val RequireRole = createRouteScopedPlugin("RequireRole", ::RequireRoleConfig) {
    val allowedRoles = pluginConfig.allowedRoles

    on(CallSetup) { call ->
        val token = call.attributes[AccessTokenKey]
        if (token.role !in allowedRoles.map { it.roleName }) {
            call.respond(
                HttpStatusCode.Forbidden,
                ErrorMessage(
                    code = "HTTP403",
                    message = "Role '${token.role}' is not authorized to perform this operation",
                ),
            )
            return@on
        }
    }
}

/**
 * Installs [RequireRole] on this route, restricting access to callers whose role is in [roles].
 *
 * Usage:
 * ```kotlin
 * route("/lookup") {
 *     requireRoles(FlexRole.SERVICE_PROVIDER, FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR)
 *     post { handler.handle(call) }
 * }
 * ```
 */
fun Route.requireRoles(vararg roles: FlexRole) {
    install(RequireRole) { allowedRoles = roles.toSet() }
}
