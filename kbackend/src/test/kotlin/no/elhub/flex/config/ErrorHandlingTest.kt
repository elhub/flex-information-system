package no.elhub.flex.config

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldStartWith
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.install
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.testing.testApplication
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

class ErrorHandlingTest : FunSpec({

    test("an unmapped exception returns the standard 500 body without leaking the cause") {
        testApplication {
            application {
                install(Tracing.plugin)
                configureErrorHandling()
                routing { get("/boom") { error("database is down") } }
            }

            val response = client.get("/boom")

            response.status shouldBe HttpStatusCode.InternalServerError
            val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
            body["code"]?.jsonPrimitive?.content shouldBe "HTTP500"
            body["message"]?.jsonPrimitive?.content shouldStartWith "An unexpected error occurred."
        }
    }
})
