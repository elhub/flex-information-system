package no.elhub.flex.api.routes.grid

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpMethod
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import no.elhub.flex.api.routes.ApiRoute
import no.elhub.flex.api.routes.grid.generated.GeneratedGridApiRoutes
import java.io.File

class GridRouteTableTest :
    FunSpec({
        test("the generated routes are exactly the routes of the OpenAPI document (run `just openapi` if not)") {
            val specRoutes = Json.parseToJsonElement(File("grid/static/openapi.json").readText())
                .jsonObject.getValue("paths").jsonObject
                .flatMap { (path, item) ->
                    item.jsonObject.keys
                        .filter { it in setOf("get", "post", "patch", "delete") }
                        .map { ApiRoute(HttpMethod.parse(it.uppercase()), path) }
                }
                .toSet()

            GeneratedGridApiRoutes.routes.toSet() shouldBe specRoutes
            GeneratedGridApiRoutes.routes.size shouldBe specRoutes.size
        }

        test("everything but the documentation is served by PostgREST") {
            val served = servedGridRoutes(GeneratedGridApiRoutes.routes).map { it.first }

            served shouldBe GeneratedGridApiRoutes.routes.filter { it.path != "/openapi.json" }
        }
    })
