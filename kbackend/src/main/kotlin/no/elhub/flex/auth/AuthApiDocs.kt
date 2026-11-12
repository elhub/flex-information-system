package no.elhub.flex.auth

import io.ktor.http.ContentType
import io.ktor.server.application.Application
import io.ktor.server.response.respondRedirect
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import no.elhub.flex.api.config.DocsConfig
import no.elhub.flex.api.routes.elementsPage
import no.elhub.flex.api.routes.openApiDocument
import no.elhub.flex.auth.plugin.optionalAuthenticatedRouting
import no.elhub.flex.auth.plugin.requireCallerScope
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import org.koin.core.annotation.Single
import org.koin.ktor.ext.inject

const val AUTH_API_MOUNT_PATH = "/auth/v1"

private const val TITLE = "Flex Auth API"

private val DOCS_SCOPE = Scope(ScopeVerb.Read, "auth:openapi")

/**
 * The interactive documentation of the auth API: the OpenAPI document and an Elements page
 * showing it.
 */
@Single(createdAtStart = true)
class AuthApiDocs(config: DocsConfig) {
    val page: String = elementsPage(TITLE)

    /** The OpenAPI document with `servers` replaced by the public URL of the API. */
    val openApi: String = openApiDocument("openapi/auth/openapi.json", config.baseUrl, AUTH_API_MOUNT_PATH, TITLE)
}

/** Registers the documentation of the auth API: `GET /auth/v1/` and `GET /auth/v1/openapi.json`. */
fun Application.authApiDocsRoutes() {
    val docs: AuthApiDocs by inject()

    optionalAuthenticatedRouting {
        route(AUTH_API_MOUNT_PATH) {
            // the page loads the OpenAPI document by a relative URL, so it needs the trailing slash
            get { call.respondRedirect("$AUTH_API_MOUNT_PATH/", permanent = true) }
            get("/") {
                if (call.requireCallerScope(DOCS_SCOPE)) {
                    call.respondText(docs.page, ContentType.Text.Html)
                }
            }
            get("/openapi.json") {
                if (call.requireCallerScope(DOCS_SCOPE)) {
                    call.respondText(docs.openApi, ContentType.Application.Json)
                }
            }
        }
    }
}
