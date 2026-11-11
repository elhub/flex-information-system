package no.elhub.flex.api.routes.data

import io.ktor.http.HttpMethod
import no.elhub.flex.api.postgrest.AttachmentReadVariant
import no.elhub.flex.api.postgrest.DefaultVariant
import no.elhub.flex.api.postgrest.EventListVariant
import no.elhub.flex.api.postgrest.PostgrestRouteVariant
import no.elhub.flex.api.routes.ApiRoute

/**
 * Decides how each route of the OpenAPI document is served: proxied to PostgREST unless listed here.
 */
object DataApiRegistry {
    private const val SPGPA = "service_providing_group_product_application"
    private const val ATTACHMENT = "service_providing_group_product_application_attachment"

    /** Routes implemented in kbackend itself. */
    val native: Set<ApiRoute> = setOf(
        ApiRoute(HttpMethod.Post, "/controllable_unit/lookup"),
        ApiRoute(HttpMethod.Post, "/entity/lookup"),
        ApiRoute(HttpMethod.Post, "/$SPGPA"),
        ApiRoute(HttpMethod.Patch, "/$SPGPA/{id}"),
        ApiRoute(HttpMethod.Post, "/$ATTACHMENT"),
        ApiRoute(HttpMethod.Delete, "/$ATTACHMENT/{id}"),
        ApiRoute(HttpMethod.Get, "/$ATTACHMENT/{id}/download"),
    )

    /**
     * Routes that are in the OpenAPI document but that the Go backend never served.
     * They stay unreachable until they are deliberately enabled.
     */
    val notExposed: Set<ApiRoute> = setOf(
        ApiRoute(HttpMethod.Get, "/${ATTACHMENT}_history"),
        ApiRoute(HttpMethod.Get, "/${ATTACHMENT}_history/{id}"),
    )

    /** Routes served by PostgREST with a deviation from the generic pipeline. */
    val variants: Map<ApiRoute, PostgrestRouteVariant> = mapOf(
        ApiRoute(HttpMethod.Get, "/event") to EventListVariant,
        ApiRoute(HttpMethod.Get, "/$ATTACHMENT") to
            AttachmentReadVariant(ATTACHMENT, "service_providing_group_product_application_id"),
        ApiRoute(HttpMethod.Get, "/$ATTACHMENT/{id}") to AttachmentReadVariant(ATTACHMENT, null),
    )

    /** The routes served by PostgREST, with their variants. */
    fun servedByPostgrest(routes: List<ApiRoute>): List<Pair<ApiRoute, PostgrestRouteVariant>> =
        routes
            .filter { it !in native && it !in notExposed }
            .map { it to (variants[it] ?: DefaultVariant) }
}
