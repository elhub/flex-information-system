package no.elhub.flex.auth.session

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.auth.authRoutes
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.db.AuthRepositoryImpl
import no.elhub.flex.auth.plugin.configureAuthentication
import no.elhub.flex.auth.util.TEST_JWT_SECRET
import no.elhub.flex.auth.util.makeJwt
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.util.UUID

/** `GET /auth/v1/session`: the session is read from the session cookie only. */
class SessionTest : FunSpec({

    // port of test/inspect/session_empty_cookie.hurl
    test("no session cookie returns 204 with an empty body") {
        val app = testApp()

        val response = app.client.get("/auth/v1/session")

        response.status shouldBe HttpStatusCode.NoContent
        response.bodyAsText() shouldBe ""
        app.stop()
    }

    // port of test/inspect/session_malformed_cookie.hurl
    test("a malformed session cookie returns 400 in the auth error format and unsets the cookie") {
        val app = testApp()

        val response = app.client.get("/auth/v1/session") {
            header(HttpHeaders.Cookie, "__Host-flex_session=malformed")
        }

        response.status shouldBe HttpStatusCode.BadRequest
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        body["code"]?.jsonPrimitive?.content shouldBe "HTTP400"
        body["message"]?.jsonPrimitive?.content shouldBe "Bad Request"
        body["details"]?.jsonPrimitive?.content shouldBe "invalid session cookie"
        body["hint"] shouldNotBe null
        val setCookie = response.headers[HttpHeaders.SetCookie].orEmpty()
        setCookie shouldContain "__Host-flex_session=not.a.session"
        setCookie shouldContain "Max-Age=0"
        setCookie shouldContain "Path=/"
        setCookie shouldContain "Secure"
        setCookie shouldContain "HttpOnly"
        setCookie shouldContain "SameSite=Strict"
        app.stop()
    }

    test("an empty session cookie returns 400") {
        val app = testApp()

        val response = app.client.get("/auth/v1/session") {
            header(HttpHeaders.Cookie, "__Host-flex_session=")
        }

        response.status shouldBe HttpStatusCode.BadRequest
        app.stop()
    }

    test("an expired session cookie returns 400") {
        val app = testApp()

        val response = app.client.get("/auth/v1/session") {
            header(HttpHeaders.Cookie, "__Host-flex_session=${makeJwt(ttlSeconds = -60)}")
        }

        response.status shouldBe HttpStatusCode.BadRequest
        app.stop()
    }

    test("the Authorization header is ignored: only the cookie makes a session") {
        val app = testApp()

        val response = app.client.get("/auth/v1/session") {
            header(HttpHeaders.Authorization, "Bearer ${makeJwt(scope = "manage:auth")}")
        }

        response.status shouldBe HttpStatusCode.NoContent
        app.stop()
    }

    // port of test/inspect/session_success.hurl, with an entity token (no party)
    test("an entity session cookie returns the session without party") {
        val entity = seed(Triggers.OFF) { insertEntityIdentity("Session IT Entity") }
        val app = testApp()

        val response = app.client.get("/auth/v1/session") {
            header(
                HttpHeaders.Cookie,
                "__Host-flex_session=${makeJwt(role = "flex_entity", eid = entity.principal.eid, scope = "manage:auth", partyId = 0)}",
            )
        }

        response.status shouldBe HttpStatusCode.OK
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        body.keys shouldBe setOf("entity_id", "entity_name", "exp", "role")
        body["entity_name"]?.jsonPrimitive?.content shouldBe "Session IT Entity"
        body["role"]?.jsonPrimitive?.content shouldBe "flex_entity"
        app.stop()
    }

    test("an identity that does not exist returns 500 in the auth error format") {
        val app = testApp()

        val response = app.client.get("/auth/v1/session") {
            header(HttpHeaders.Cookie, "__Host-flex_session=${makeJwt(role = "flex_entity", eid = UUID.randomUUID().toString(), scope = "manage:auth")}")
        }

        response.status shouldBe HttpStatusCode.InternalServerError
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        body["code"]?.jsonPrimitive?.content shouldBe "HTTP500"
        body["message"]?.jsonPrimitive?.content shouldBe "Internal Server Error"
        body["details"]?.jsonPrimitive?.content shouldBe "could not get current user info"
        app.stop()
    }

    test("a session cookie that does not cover read:auth:session returns 403") {
        val app = testApp()

        val response = app.client.get("/auth/v1/session") {
            header(HttpHeaders.Cookie, "__Host-flex_session=${makeJwt(scope = "read:data")}")
        }

        response.status shouldBe HttpStatusCode.Forbidden
        response.headers[HttpHeaders.WWWAuthenticate] shouldContain "insufficient_scope"
        app.stop()
    }
})

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
                        single { SessionHandler(AuthConfig(TEST_JWT_SECRET), AuthRepositoryImpl()) }
                    },
                )
            }
            authRoutes()
        }
    }
