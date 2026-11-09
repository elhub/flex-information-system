package no.elhub.flex.api.routes.data

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpMethod
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import no.elhub.flex.api.routes.ApiRoute
import no.elhub.flex.api.routes.data.generated.GeneratedDataApiRoutes
import java.io.File

/**
 * Keeps the generated route table, the OpenAPI document and the registry in agreement,
 * since the routes served are an allowlist.
 */
class RouteTableTest :
    FunSpec({
        val specRoutes = Json.parseToJsonElement(File("data/static/openapi.json").readText())
            .jsonObject.getValue("paths").jsonObject
            .filterKeys { it != "/" }
            .flatMap { (path, item) ->
                item.jsonObject.keys
                    .filter { it in setOf("get", "post", "patch", "delete") }
                    .map { ApiRoute(HttpMethod.parse(it.uppercase()), path) }
            }
            .toSet()

        test("the generated routes are exactly the routes of the OpenAPI document (run `just openapi` if not)") {
            GeneratedDataApiRoutes.routes.toSet() shouldBe specRoutes
            GeneratedDataApiRoutes.routes.size shouldBe specRoutes.size
        }

        test("every route in the registry exists") {
            val generated = GeneratedDataApiRoutes.routes.toSet()

            (DataApiRegistry.native - generated).shouldBeEmpty()
            (DataApiRegistry.notExposed - generated).shouldBeEmpty()
            (DataApiRegistry.variants.keys - generated).shouldBeEmpty()
        }

        test("a route is native, not exposed or served by PostgREST, never several") {
            (DataApiRegistry.native intersect DataApiRegistry.notExposed).shouldBeEmpty()
            (DataApiRegistry.native intersect DataApiRegistry.variants.keys).shouldBeEmpty()
            (DataApiRegistry.notExposed intersect DataApiRegistry.variants.keys).shouldBeEmpty()
        }

        test("every route is served one way") {
            val postgrestRoutes = DataApiRegistry.servedByPostgrest(GeneratedDataApiRoutes.routes).map { it.first }.toSet()

            (postgrestRoutes + DataApiRegistry.native + DataApiRegistry.notExposed) shouldBe GeneratedDataApiRoutes.routes.toSet()
        }
    })
