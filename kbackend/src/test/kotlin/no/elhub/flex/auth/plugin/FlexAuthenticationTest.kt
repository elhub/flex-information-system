package no.elhub.flex.auth.plugin

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.core.spec.style.FunSpec
import io.kotest.datatest.withData
import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.install
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.testing.TestApplication
import no.elhub.flex.api.util.TEST_JWT_SECRET
import no.elhub.flex.config.configureSerialization
import java.util.Date

private const val INVALID_TOKEN_CHALLENGE = """Bearer error="invalid_token", error_description="invalid bearer token""""
private const val INVALID_TOKEN_BODY = """
    {"error": "invalid_request", "error_description": "unable to verify and validate token"}
"""

class FlexAuthenticationTest : FunSpec({

    context("token resolution") {

        test("accepts a Bearer token in the Authorization header") {
            val app = testApp()

            val response = app.client.get("/whoami") { header(HttpHeaders.Authorization, "Bearer ${jwt()}") }

            response.status shouldBe HttpStatusCode.OK
            response.bodyAsText() shouldBe "flex_service_provider"
            app.stop()
        }

        test("accepts the session cookie when there is no Authorization header") {
            val app = testApp()

            val response = app.client.get("/whoami") { header(HttpHeaders.Cookie, "__Host-flex_session=${jwt()}") }

            response.status shouldBe HttpStatusCode.OK
            app.stop()
        }

        test("an empty Authorization header counts as absent") {
            val app = testApp()

            val withCookie = app.client.get("/whoami") {
                header(HttpHeaders.Authorization, "")
                header(HttpHeaders.Cookie, "__Host-flex_session=${jwt()}")
            }
            val withoutCookie = app.client.get("/whoami") { header(HttpHeaders.Authorization, "") }

            withCookie.status shouldBe HttpStatusCode.OK
            withoutCookie.status shouldBe HttpStatusCode.Unauthorized
            app.stop()
        }

        test("the Authorization header takes precedence over a valid cookie") {
            val app = testApp()

            val response = app.client.get("/whoami") {
                header(HttpHeaders.Authorization, "Bearer not.a.jwt")
                header(HttpHeaders.Cookie, "__Host-flex_session=${jwt()}")
            }

            response.status shouldBe HttpStatusCode.BadRequest
            app.stop()
        }
    }

    context("responses") {

        test("no token: 401 with a Bearer challenge") {
            val app = testApp()

            val response = app.client.get("/whoami")

            response.status shouldBe HttpStatusCode.Unauthorized
            response.headers[HttpHeaders.WWWAuthenticate] shouldBe "Bearer"
            app.stop()
        }

        test("Authorization header that is not a Bearer header: 400 invalid_request") {
            val app = testApp()

            val response = app.client.get("/whoami") { header(HttpHeaders.Authorization, "Basic dXNlcjpwYXNz") }

            response.status shouldBe HttpStatusCode.BadRequest
            response.headers[HttpHeaders.WWWAuthenticate] shouldBe
                """Bearer error="invalid_request", error_description="missing Bearer in Authorization header""""
            response.bodyAsText() shouldEqualJson """
                {"error": "invalid_request", "error_description": "missing Bearer in Authorization header"}
            """.trimIndent()
            app.stop()
        }

        test("a Bearer prefix with different case is not a Bearer header") {
            val app = testApp()

            val response = app.client.get("/whoami") { header(HttpHeaders.Authorization, "bearer ${jwt()}") }

            response.status shouldBe HttpStatusCode.BadRequest
            app.stop()
        }
    }

    context("invalid tokens are rejected with 400 invalid_token") {

        withData(
            mapOf(
                "not a jwt" to "not.a.jwt",
                "signed with another secret" to jwt(secret = "another-secret-that-is-long-enough-for-hs256"),
                "expired" to jwt(expiresInSeconds = -60),
                "scope with an unparsable part" to jwt(scope = "read:auth read"),
                "empty scope" to jwt(scope = ""),
                "missing scope claim" to jwt(scope = null),
                "party role without party_id" to jwt(role = "flex_service_provider", partyId = null),
                "party role with party_id 0" to jwt(role = "flex_service_provider", partyId = 0),
            ),
        ) { token ->
            val app = testApp()

            val response = app.client.get("/whoami") { header(HttpHeaders.Authorization, "Bearer $token") }

            response.status shouldBe HttpStatusCode.BadRequest
            response.headers[HttpHeaders.WWWAuthenticate] shouldBe INVALID_TOKEN_CHALLENGE
            response.bodyAsText() shouldEqualJson INVALID_TOKEN_BODY.trimIndent()
            app.stop()
        }

        test("the same invalid token in the session cookie") {
            val app = testApp()

            val response = app.client.get("/whoami") { header(HttpHeaders.Cookie, "__Host-flex_session=not.a.jwt") }

            response.status shouldBe HttpStatusCode.BadRequest
            response.headers[HttpHeaders.WWWAuthenticate] shouldBe INVALID_TOKEN_CHALLENGE
            app.stop()
        }
    }

    context("valid tokens") {

        test("an entity token does not need a party_id") {
            val app = testApp()

            val response = app.client.get("/whoami") {
                header(HttpHeaders.Authorization, "Bearer ${jwt(role = "flex_entity", partyId = null)}")
            }

            response.status shouldBe HttpStatusCode.OK
            response.bodyAsText() shouldBe "flex_entity"
            app.stop()
        }
    }
})

private fun jwt(
    role: String = "flex_service_provider",
    partyId: Int? = 1,
    scope: String? = "read:auth:userinfo",
    expiresInSeconds: Long = 60,
    secret: String = TEST_JWT_SECRET,
): String =
    JWT.create()
        .withClaim("entity_id", 1)
        .withClaim("eid", "eid-1")
        .withClaim("role", role)
        .apply {
            partyId?.let { withClaim("party_id", it) }
            scope?.let { withClaim("scope", it) }
        }
        .withExpiresAt(Date(System.currentTimeMillis() + expiresInSeconds * 1000))
        .sign(Algorithm.HMAC256(secret))

private fun testApp(): TestApplication =
    TestApplication {
        application {
            configureSerialization()
            install(FlexAuthentication) { jwtSecret = TEST_JWT_SECRET }
            routing {
                get("/whoami") { call.respondText(call.attributes[AccessTokenKey].role) }
            }
        }
    }
