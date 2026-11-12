package no.elhub.flex.auth

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.api.config.DocsConfig
import no.elhub.flex.auth.plugin.configureAuthentication
import no.elhub.flex.auth.util.TEST_JWT_SECRET
import no.elhub.flex.auth.util.makeJwt
import no.elhub.flex.config.configureSerialization
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.io.File

class AuthApiDocsTest :
    FunSpec({
        lateinit var app: TestApplication

        beforeSpec {
            val docs = AuthApiDocs(DocsConfig("https://flex.test/"))
            app = TestApplication {
                application {
                    configureSerialization()
                    configureAuthentication(TEST_JWT_SECRET)
                    install(Koin) { modules(module { single { docs } }) }
                    authApiDocsRoutes()
                }
            }
        }

        afterSpec { app.stop() }

        test("serves the OpenAPI document with the public server URL") {
            val response = app.client.get("/auth/v1/openapi.json")

            response.status shouldBe HttpStatusCode.OK
            response.contentType()?.withoutParameters() shouldBe ContentType.Application.Json

            val served = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            val servers = served.getValue("servers").jsonArray
            servers.size shouldBe 1
            servers[0].jsonObject.getValue("url").jsonPrimitive.content shouldBe "https://flex.test/auth/v1/"

            val original = Json.parseToJsonElement(File("auth/static/openapi.json").readText()).jsonObject
            served.getValue("paths") shouldBe original.getValue("paths")
            served.getValue("components") shouldBe original.getValue("components")
        }

        test("serves the documentation page") {
            val response = app.client.get("/auth/v1/")

            response.status shouldBe HttpStatusCode.OK
            response.contentType()?.withoutParameters() shouldBe ContentType.Text.Html
            val page = response.bodyAsText()
            page shouldContain "<title>Flex Auth API</title>"
            page shouldContain """apiDescriptionUrl="openapi.json""""
        }

        test("the path without a trailing slash redirects to the documentation page") {
            val response = app.createClient { followRedirects = false }.get("/auth/v1")

            response.status shouldBe HttpStatusCode.MovedPermanently
            response.headers["Location"] shouldBe "/auth/v1/"
        }

        test("a token without the scope to read the documentation is refused") {
            val response = app.client.get("/auth/v1/openapi.json") {
                header(HttpHeaders.Authorization, "Bearer ${makeJwt(role = "flex_entity", scope = "read:data")}")
            }

            response.status shouldBe HttpStatusCode.Forbidden
        }

        test("an invalid token is refused") {
            val response = app.client.get("/auth/v1/") {
                header(HttpHeaders.Authorization, "Bearer garbage")
            }

            response.status shouldBe HttpStatusCode.Unauthorized
        }
    })
