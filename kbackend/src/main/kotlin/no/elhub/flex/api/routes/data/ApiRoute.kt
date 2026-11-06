package no.elhub.flex.api.routes.data

import io.ktor.http.HttpMethod

/** A route of the data API, as listed in the OpenAPI document. */
data class ApiRoute(val method: HttpMethod, val path: String)
