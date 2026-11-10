package no.elhub.flex.api.attachment

import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.routing.get
import io.ktor.server.routing.method
import io.ktor.server.routing.route
import no.elhub.flex.api.routes.data.DATA_API_MOUNT_PATH
import no.elhub.flex.auth.plugin.FlexRole
import no.elhub.flex.auth.plugin.authenticatedRouting
import no.elhub.flex.auth.plugin.requireRoles
import no.elhub.flex.auth.plugin.requireScope
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import org.koin.ktor.ext.inject

/**
 * Registers the given [baseResource]'s attachment routes.
 *
 * Stateful endpoints (upload/delete) are restricted to the given list of [editRoles], if given.
 */
fun Application.attachmentRoutes(
    baseResource: String,
    editRoles: List<FlexRole>,
) {
    // use of `method` to make sure plugins are not installed twice or applied to subroutes meant to override
    // scope or role check with potentially different values
    authenticatedRouting {
        val storage: AttachmentStorageService by inject()

        val handler = AttachmentHandler(baseResource, storage)

        route(DATA_API_MOUNT_PATH) {
            route("/${baseResource}_attachment") {
                method(HttpMethod.Post) {
                    requireScope(Scope(ScopeVerb.Manage, "attachment:${baseResource}_attachment"))
                    editRoles.takeIf { it.isNotEmpty() }?.let {
                        requireRoles(*it.toTypedArray())
                    }
                    handle { handler.create(call) }
                }
            }
            route("/${baseResource}_attachment/{id}") {
                method(HttpMethod.Delete) {
                    requireScope(Scope(ScopeVerb.Manage, "attachment:${baseResource}_attachment"))
                    editRoles.takeIf { it.isNotEmpty() }?.let {
                        requireRoles(*it.toTypedArray())
                    }
                    handle { handler.delete(call) }
                }
                route("/download") {
                    requireScope(Scope(ScopeVerb.Read, "attachment:${baseResource}_attachment"))
                    get { handler.download(call) }
                }
            }
        }
    }
}
