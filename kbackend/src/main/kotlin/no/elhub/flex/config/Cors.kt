package no.elhub.flex.config

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.cors.routing.CORS

/** Allows browser clients on any origin to call the API with a bearer token. Cookies are not allowed cross-origin. */
fun Application.configureCors() {
    install(CORS) {
        anyHost()
        allowNonSimpleContentTypes = true
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Patch)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.Authorization)
        allowHeader("Api-Version")
        exposeHeader("Api-Version")
    }
}
