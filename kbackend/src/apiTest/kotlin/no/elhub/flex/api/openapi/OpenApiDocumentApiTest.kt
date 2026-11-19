package no.elhub.flex.api.openapi

import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.ApiSpec
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

class OpenApiDocumentApiTest :
    ApiSpec({
        beforeEach { truncate("flex.party", "flex.entity") }

        test("is served as an OpenAPI document") {
            val entity = seed { insertActor(TestPartyRole.EU) }

            val response = api.get("/openapi.json", entity.token())

            response.status shouldBe HttpStatusCode.OK
            Json.parseToJsonElement(response.text).jsonObject["openapi"]?.jsonPrimitive?.content?.startsWith("3.") shouldBe true
        }
    })
