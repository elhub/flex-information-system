package no.elhub.flex.attachment

import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.routing.get
import io.ktor.server.routing.method
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.auth.FlexRole
import no.elhub.flex.auth.Scope
import no.elhub.flex.auth.ScopeVerb
import no.elhub.flex.auth.requireRoles
import no.elhub.flex.auth.requireScope
import no.elhub.flex.storage.FileContentParser
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
    routing {
        val storage: AttachmentStorageService by inject()
        val fileParser: FileContentParser by inject()

        val handler = AttachmentHandler(baseResource, storage, fileParser)

        route("/${baseResource}_attachment") {
            method(HttpMethod.Post) {
                requireScope(Scope(ScopeVerb.Manage, "data:${baseResource}_attachment"))
                editRoles.takeIf { it.isNotEmpty() }?.let {
                    requireRoles(*it.toTypedArray())
                }
                handle { handler.create(call) }
            }
        }
        route("/${baseResource}_attachment/{id}") {
            method(HttpMethod.Delete) {
                requireScope(Scope(ScopeVerb.Manage, "data:${baseResource}_attachment"))
                editRoles.takeIf { it.isNotEmpty() }?.let {
                    requireRoles(*it.toTypedArray())
                }
                handle { handler.delete(call) }
            }
            route("/download") {
                requireScope(Scope(ScopeVerb.Read, "data:${baseResource}_attachment"))
                get { handler.download(call) }
            }
        }
    }
}
