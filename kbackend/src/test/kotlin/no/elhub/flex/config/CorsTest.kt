package no.elhub.flex.config

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.options
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.testing.testApplication

class CorsTest : FunSpec({

    test("preflight requests from any origin are allowed with the API headers") {
        testApplication {
            application {
                configureCors()
                routing { get("/x") { call.respondText("ok") } }
            }

            val response = client.options("/x") {
                header(HttpHeaders.Origin, "https://third-party.example")
                header(HttpHeaders.AccessControlRequestMethod, HttpMethod.Patch.value)
                header(HttpHeaders.AccessControlRequestHeaders, "Authorization, Api-Version, Content-Type")
            }

            response.status shouldBe HttpStatusCode.OK
            response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBe "*"
            response.headers[HttpHeaders.AccessControlAllowMethods] shouldContain "PATCH"
            response.headers[HttpHeaders.AccessControlAllowHeaders] shouldContain "Api-Version"
        }
    }

    test("Api-Version is exposed to browser clients") {
        testApplication {
            application {
                configureCors()
                routing { get("/x") { call.respondText("ok") } }
            }

            val response = client.get("/x") { header(HttpHeaders.Origin, "https://third-party.example") }

            response.headers[HttpHeaders.AccessControlAllowOrigin] shouldBe "*"
            response.headers[HttpHeaders.AccessControlExposeHeaders] shouldContain "Api-Version"
        }
    }
})
