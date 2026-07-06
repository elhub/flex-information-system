package no.elhub.flex.generic.attachment

import io.ktor.server.application.Application
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import no.elhub.flex.auth.FlexRole
import no.elhub.flex.auth.Scope
import no.elhub.flex.auth.ScopeVerb
import no.elhub.flex.auth.requireRoles
import no.elhub.flex.auth.requireScope
import no.elhub.flex.routes.attachment.AttachmentHandler
import no.elhub.flex.storage.AttachmentStorageService
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
    val storage: AttachmentStorageService by inject()
    val fileParser: FileContentParser by inject()

    val handler = AttachmentHandler(baseResource, storage, fileParser)

    routing {
        route("/${baseResource}_attachment/{id}/download") {
            requireScope(Scope(ScopeVerb.Read, "data"))
            requireScope(Scope(ScopeVerb.Read, "data:${baseResource}_attachment"))
            get { handler.download(call) }
        }
        route("/${baseResource}_attachment") {
            requireScope(Scope(ScopeVerb.Manage, "data:${baseResource}_attachment"))
            editRoles.takeIf { it.isNotEmpty() }?.let {
                requireRoles(*it.toTypedArray())
            }
            post { handler.create(call) }
        }
        route("/${baseResource}_attachment/{id}") {
            requireScope(Scope(ScopeVerb.Manage, "data:${baseResource}_attachment"))
            editRoles.takeIf { it.isNotEmpty() }?.let {
                requireRoles(*it.toTypedArray())
            }
            delete { handler.delete(call) }
        }
    }
}
