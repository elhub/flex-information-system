package no.elhub.flex.api.routes.attachment

import io.ktor.server.application.Application
import no.elhub.flex.api.attachment.attachmentRoutes
import no.elhub.flex.api.auth.FlexRole

/** Defines routes for all attachments. */
fun Application.attachmentRoutes() {
    attachmentRoutes(
        "service_providing_group_product_application",
        listOf(FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR, FlexRole.SERVICE_PROVIDER),
    )
}
