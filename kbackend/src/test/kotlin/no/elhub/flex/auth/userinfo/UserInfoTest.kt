package no.elhub.flex.auth.userinfo

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldStartWith
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.long
import no.elhub.flex.api.util.Triggers
import no.elhub.flex.api.util.seed
import no.elhub.flex.auth.authRoutes
import no.elhub.flex.auth.db.AuthRepositoryImpl
import no.elhub.flex.auth.plugin.configureAuthentication
import no.elhub.flex.auth.util.TEST_JWT_SECRET
import no.elhub.flex.auth.util.makeJwt
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureSerialization
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.util.UUID

/**
 * `GET /auth/v1/userinfo` through the whole chain: a signed token is verified, the identity is read
 * from a real database as the role of the token, and the response is serialized.
 *
 * Port of the userinfo tests of `test/auth_tests/test_userinfo.py`, which run against the deployed stack.
 */
class UserInfoTest : FunSpec({

    context("GET /auth/v1/userinfo with a real database") {

        test("an entity token returns partial information: no party") {
            val entity = seed(Triggers.OFF) { insertEntityIdentity("Userinfo IT Entity") }
            val app = testApp()

            val response = app.client.get("/auth/v1/userinfo") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = "flex_entity", eid = entity.principal.eid, scope = "manage:auth")}",
                )
            }

            response.status shouldBe HttpStatusCode.OK
            val body = response.json()
            body.keys shouldBe setOf("sub", "entity_id", "entity_name", "current_role")
            body.string("sub") shouldBe entity.principal.eid
            body["entity_id"]?.jsonPrimitive?.long shouldBe entity.entityId
            body.string("entity_name") shouldBe "Userinfo IT Entity"
            body.string("current_role") shouldBe "flex_entity"
            app.stop()
        }

        test("a party token returns the full record") {
            val so = seed(Triggers.OFF) { insertSystemOperator("Userinfo IT SO") }
            val app = testApp()

            val response = app.client.get("/auth/v1/userinfo") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = "flex_system_operator", eid = so.principal.eid, scope = "manage:auth")}",
                )
            }

            response.status shouldBe HttpStatusCode.OK
            val body = response.json()
            body.keys shouldBe setOf("sub", "entity_id", "entity_name", "party_id", "party_name", "current_role")
            body.string("sub") shouldBe so.principal.eid
            body["party_id"]?.jsonPrimitive?.long shouldBe so.partyId
            body.string("party_name") shouldBe "Userinfo IT SO"
            body.string("current_role") shouldBe "flex_system_operator"
            app.stop()
        }

        test("the session cookie works like the Authorization header") {
            val entity = seed(Triggers.OFF) { insertEntityIdentity("Userinfo IT Cookie") }
            val app = testApp()

            val response = app.client.get("/auth/v1/userinfo") {
                header(
                    HttpHeaders.Cookie,
                    "__Host-flex_session=${makeJwt(role = "flex_entity", eid = entity.principal.eid, scope = "manage:auth")}",
                )
            }

            response.status shouldBe HttpStatusCode.OK
            response.json().string("sub") shouldBe entity.principal.eid
            app.stop()
        }

        test("a valid token for an identity that does not exist returns 500") {
            val app = testApp()

            val response = app.client.get("/auth/v1/userinfo") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = "flex_entity", eid = UUID.randomUUID().toString(), scope = "manage:auth")}",
                )
            }

            response.shouldBeInternalServerError()
            app.stop()
        }

        test("a token with a role that is not a role of the auth API returns 500") {
            val app = testApp()

            val response = app.client.get("/auth/v1/userinfo") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = "flex_made_up", eid = UUID.randomUUID().toString(), scope = "manage:auth")}",
                )
            }

            response.shouldBeInternalServerError()
            app.stop()
        }
    }

    context("authentication and authorization") {

        test("no token returns 401 with a Bearer challenge") {
            val app = testApp()

            val response = app.client.get("/auth/v1/userinfo")

            response.status shouldBe HttpStatusCode.Unauthorized
            response.headers[HttpHeaders.WWWAuthenticate] shouldBe "Bearer"
            app.stop()
        }

        test("a token that does not cover read:auth:userinfo returns 403") {
            val app = testApp()

            val response = app.client.get("/auth/v1/userinfo") {
                header(HttpHeaders.Authorization, "Bearer ${makeJwt(scope = "read:data")}")
            }

            response.status shouldBe HttpStatusCode.Forbidden
            app.stop()
        }
    }
})

private suspend fun HttpResponse.json(): JsonObject =
    Json.parseToJsonElement(bodyAsText()).jsonObject

/** The standard error body of the APIs: a generic message that does not leak the cause, and a trace id. */
private suspend fun HttpResponse.shouldBeInternalServerError() {
    status shouldBe HttpStatusCode.InternalServerError
    val body = json()
    body.keys shouldBe setOf("code", "message")
    body.string("code") shouldBe "HTTP500"
    body.string("message") shouldStartWith "An unexpected error occurred."
}

private fun JsonObject.string(key: String): String? = this[key]?.jsonPrimitive?.content

private fun testApp(): TestApplication =
    TestApplication {
        application {
            install(Tracing.plugin)
            configureAuthentication(TEST_JWT_SECRET)
            configureSerialization()
            configureLogging()
            install(Koin) {
                modules(
                    module {
                        single { UserInfoHandler(AuthRepositoryImpl()) }
                    },
                )
            }
            authRoutes()
        }
    }
