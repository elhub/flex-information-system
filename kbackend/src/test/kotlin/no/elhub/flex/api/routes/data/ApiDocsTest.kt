package no.elhub.flex.api.routes.data

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.api.config.DocsConfig
import no.elhub.flex.api.config.RequireApiVersion
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.io.File

class ApiDocsTest :
    FunSpec({
        lateinit var app: TestApplication

        beforeSpec {
            val docs = ApiDocs(DocsConfig("https://flex.test/"))
            app = TestApplication {
                application {
                    // the documentation needs no Api-Version, like in the real application
                    install(RequireApiVersion) { exemptPaths += listOf("/", "/openapi.json") }
                    install(Koin) { modules(module { single { docs } }) }
                    apiDocsRoutes()
                }
            }
        }

        afterSpec { app.stop() }

        test("serves the OpenAPI document with the public server URL") {
            val response = app.client.get("/openapi.json")

            response.status shouldBe HttpStatusCode.OK
            response.contentType()?.withoutParameters() shouldBe ContentType.Application.Json

            val served = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            val servers = served.getValue("servers").jsonArray
            servers.size shouldBe 1
            servers[0].jsonObject.getValue("url").jsonPrimitive.content shouldBe "https://flex.test/api/v1/"

            val original = Json.parseToJsonElement(File("data/static/openapi.json").readText()).jsonObject
            served.getValue("paths") shouldBe original.getValue("paths")
            served.getValue("components") shouldBe original.getValue("components")
        }

        test("serves the documentation page") {
            val response = app.client.get("/")

            response.status shouldBe HttpStatusCode.OK
            response.contentType()?.withoutParameters() shouldBe ContentType.Text.Html
            val page = response.bodyAsText()
            page shouldContain "<title>Flex Data API</title>"
            page shouldContain """apiDescriptionUrl="openapi.json""""
        }
    })
