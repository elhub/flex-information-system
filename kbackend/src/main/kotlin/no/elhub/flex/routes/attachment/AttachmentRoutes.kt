package no.elhub.flex.routes.attachment

import io.ktor.server.application.Application
import no.elhub.flex.attachment.attachmentRoutes
import no.elhub.flex.auth.FlexRole

/** Defines routes for all attachments. */
fun Application.attachmentRoutes() {
    attachmentRoutes(
        "service_providing_group_product_application",
        listOf(FlexRole.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR, FlexRole.SERVICE_PROVIDER),
    )
}
