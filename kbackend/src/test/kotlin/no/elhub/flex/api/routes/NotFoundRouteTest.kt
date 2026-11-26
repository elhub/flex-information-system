package no.elhub.flex.api.routes

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.application.install
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.testing.TestApplication
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.api.config.RequireApiVersion
import no.elhub.flex.api.routes.data.DATA_API_MOUNT_PATH
import no.elhub.flex.config.configureSerialization

class NotFoundRouteTest :
    FunSpec({
        lateinit var app: TestApplication

        beforeSpec {
            app = TestApplication {
                application {
                    configureSerialization()
                    install(RequireApiVersion) { pathPrefixes += DATA_API_MOUNT_PATH }
                    routing { get("/known") { call.respondText("ok") } }
                    notFoundRoute()
                }
            }
        }

        afterSpec { app.stop() }

        test("any unknown URL is a JSON not found, without an Api-Version") {
            for (path in listOf("/", "/nope", "/nope/deeper", "/grid/nope", "/api/nope")) {
                val response = app.client.get(path)

                response.status shouldBe HttpStatusCode.NotFound
                response.contentType()?.withoutParameters() shouldBe ContentType.Application.Json
                val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
                body.getValue("code").jsonPrimitive.content shouldBe "HTTP404"
                body.getValue("message").jsonPrimitive.content shouldBe "Not Found: GET $path"
            }
        }

        test("a known path with another method is a not found") {
            val response = app.client.post("/known")

            response.status shouldBe HttpStatusCode.NotFound
            Json.parseToJsonElement(response.bodyAsText()).jsonObject.getValue("message").jsonPrimitive.content shouldBe
                "Not Found: POST /known"
        }

        test("known routes are not affected") {
            app.client.get("/known").bodyAsText() shouldBe "ok"
        }

        test("under the data API the version is still required first") {
            app.client.get("/api/v1/nope").status shouldBe HttpStatusCode.BadRequest
        }
    })
