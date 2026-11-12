package no.elhub.flex.auth.assume

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.ints.shouldBeInRange
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.delete
import io.ktor.client.request.forms.submitForm
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.Parameters
import io.ktor.http.content.ChannelWriterContent
import io.ktor.http.contentType
import io.ktor.http.setCookie
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import io.ktor.utils.io.writeStringUtf8
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.auth.authRoutes
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.db.AuthRepositoryImpl
import no.elhub.flex.auth.plugin.configureAuthentication
import no.elhub.flex.auth.scope.DefaultEntityScopes
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.token.AccessToken
import no.elhub.flex.auth.util.TEST_JWT_SECRET
import no.elhub.flex.auth.util.makeJwt
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.util.UUID

private const val SESSION_COOKIE = "__Host-flex_session"
private const val SESSION_TTL_SECONDS = 600L

private val repository = AuthRepositoryImpl()

/** `POST` and `DELETE /auth/v1/assume`: a person assumes a party, or goes back to the bare entity, in the browser. */
class AssumeTest : FunSpec({

    context("assume") {

        test("a member of a party gets a session cookie for the party, with the scopes of the membership") {
            val (entity, partyId) = seedMember()
            val app = testApp()

            val response = app.assume(entityCookie(entity.entityId, entity.principal.eid), partyId)

            response.status shouldBe HttpStatusCode.OK
            val body = response.json()
            body.keys shouldBe setOf("entity_id", "entity_name", "exp", "party_id", "party_name", "role")
            body["entity_id"]?.jsonPrimitive?.int shouldBe entity.entityId.toInt()
            body["party_id"]?.jsonPrimitive?.int shouldBe partyId.toInt()
            body["party_name"]?.jsonPrimitive?.content shouldBe "Assume SP"
            body["role"]?.jsonPrimitive?.content shouldBe "flex_service_provider"

            val cookie = response.sessionCookie()
            cookie.maxAge?.shouldBeInRange((SESSION_TTL_SECONDS.toInt() - 5)..SESSION_TTL_SECONDS.toInt())
            val setCookie = response.headers[HttpHeaders.SetCookie].orEmpty()
            setCookie shouldContain "Secure"
            setCookie shouldContain "HttpOnly"
            setCookie shouldContain "SameSite=Strict"
            val token = AccessToken.parse(cookie.value, TEST_JWT_SECRET).shouldBeRight()
            token.partyId shouldBe partyId.toInt()
            token.role shouldBe "flex_service_provider"
            token.scope shouldBe listOf(Scope(ScopeVerb.Manage, "auth"))
            token.expiryUnixSeconds shouldBe body["exp"]?.jsonPrimitive?.int?.toLong()
            app.stop()
        }

        test("an owner of a party gets a session cookie for the party") {
            val (owner, so) = seed(Triggers.OFF) {
                val so = insertSystemOperator("Assume Owned SO")
                insertIdentityOf(so.entityId) to so
            }
            val app = testApp()

            val response = app.assume(entityCookie(owner.entityId, owner.principal.eid), so.partyId)

            response.status shouldBe HttpStatusCode.OK
            response.json()["role"]?.jsonPrimitive?.content shouldBe "flex_system_operator"
            app.stop()
        }

        test("a missing session cookie returns 400 invalid_request") {
            val app = testApp()

            val response = app.assume(cookie = null, partyId = 1, bearer = makeJwt(scope = "manage:auth"))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "missing session cookie")
            app.stop()
        }

        test("an anonymous caller returns 403") {
            val app = testApp()

            val response = app.assume(cookie = null, partyId = 1)

            response.status shouldBe HttpStatusCode.Forbidden
            app.stop()
        }

        test("an invalid session cookie returns 400 invalid_request") {
            val app = testApp()

            // the cookie is also the token of the caller when there is no Authorization header, so it is checked first
            val response = app.assume(cookie = "not.a.jwt", partyId = 1)

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "unable to verify and validate token")
            app.stop()
        }

        test("a session cookie that is not the token of the Authorization header returns 400 invalid_request") {
            val app = testApp()

            val response = app.assume(cookie = "not.a.jwt", partyId = 1, bearer = makeJwt(scope = "manage:auth:assume"))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "invalid session cookie")
            app.stop()
        }

        test("a caller that does not cover manage:auth:assume returns 403") {
            val app = testApp()

            val response = app.assume(cookie = makeJwt(role = "flex_entity", partyId = 0, scope = "read:data"), partyId = 1)

            response.status shouldBe HttpStatusCode.Forbidden
            response.headers[HttpHeaders.WWWAuthenticate] shouldContain "insufficient_scope"
            app.stop()
        }

        test("a body that is not a form returns 400 invalid_request") {
            val app = testApp()

            val response = app.client.post("/auth/v1/assume") {
                header(HttpHeaders.Cookie, "$SESSION_COOKIE=${entityCookie(1, "eid")}")
                contentType(ContentType.Application.Json)
                setBody("""{"party_id":1}""")
            }

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "invalid content type")
            app.stop()
        }

        test("a form without Content-Length is read like any other") {
            val (entity, partyId) = seedMember()
            val app = testApp()

            val response = app.assumeChunked(entityCookie(entity.entityId, entity.principal.eid), "party_id=$partyId")

            response.status shouldBe HttpStatusCode.OK
            response.json()["party_id"]?.jsonPrimitive?.int shouldBe partyId.toInt()
            app.stop()
        }

        test("a form of more than 1 KiB is read as an empty one, with or without Content-Length") {
            val app = testApp()
            val cookie = entityCookie(1, "eid")
            val bigForm = "party_id=1&padding=${"x".repeat(2000)}"

            val chunked = app.assumeChunked(cookie, bigForm)
            val sized = app.client.post("/auth/v1/assume") {
                header(HttpHeaders.Cookie, "$SESSION_COOKIE=$cookie")
                contentType(ContentType.Application.FormUrlEncoded)
                setBody(bigForm)
            }

            listOf(chunked, sized).forEach { response ->
                response.status shouldBe HttpStatusCode.BadRequest
                response.json().oauthError() shouldBe ("invalid_request" to "party_id is required")
            }
            app.stop()
        }

        test("a missing party_id returns 400 invalid_request") {
            val app = testApp()

            val response = app.assume(entityCookie(1, "eid"), partyId = null)

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "party_id is required")
            app.stop()
        }

        test("a party_id that is not an integer returns 400 invalid_request") {
            val app = testApp()

            val response = app.assume(entityCookie(1, "eid"), partyId = "abc")

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "party_id must be an integer")
            app.stop()
        }

        test("an identity that does not exist returns 500 server_error") {
            val app = testApp()

            val response = app.assume(entityCookie(1, UUID.randomUUID().toString()), partyId = 1)

            response.status shouldBe HttpStatusCode.InternalServerError
            response.json().oauthError() shouldBe ("server_error" to "could not get entity identity in assume handler")
            app.stop()
        }

        test("an entity client returns 400 invalid_client") {
            val (client, partyId) = seed(Triggers.OFF) {
                val partyId = insertServiceProvider("Assume Client SP")
                val client = insertEntityClient()
                insertPartyMembership(partyId, client.entityId)
                client to partyId
            }
            val identity = with(FlexPrincipal.anonymous) { repository.entityClientByClientId(client.clientId) }.shouldBeRight()
            val app = testApp()

            val response = app.assume(entityCookie(client.entityId, identity.externalId), partyId)

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_client" to "client is not allowed to assume a party")
            app.stop()
        }

        test("a party that the entity can not assume returns 400 invalid_target") {
            val (entity, partyId) = seed(Triggers.OFF) { insertEntityIdentity("Assume Stranger") to insertServiceProvider("Foreign SP") }
            val app = testApp()

            val response = app.assume(entityCookie(entity.entityId, entity.principal.eid), partyId)

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_target" to "cannot assume requested party")
            app.stop()
        }
    }

    context("unassume") {

        test("a party session goes back to the entity, with the default scopes") {
            val (entity, partyId) = seedMember()
            val app = testApp()
            val partyCookie = app.assume(entityCookie(entity.entityId, entity.principal.eid), partyId).sessionCookie().value

            val response = app.unassume(partyCookie)

            response.status shouldBe HttpStatusCode.OK
            val body = response.json()
            body.keys shouldBe setOf("entity_id", "entity_name", "exp", "role")
            body["entity_id"]?.jsonPrimitive?.int shouldBe entity.entityId.toInt()
            body["role"]?.jsonPrimitive?.content shouldBe "flex_entity"
            val token = AccessToken.parse(response.sessionCookie().value, TEST_JWT_SECRET).shouldBeRight()
            token.partyId shouldBe 0
            token.role shouldBe "flex_entity"
            token.externalId shouldBe entity.principal.eid
            token.scope shouldBe DefaultEntityScopes
            token.expiryUnixSeconds shouldBe body["exp"]?.jsonPrimitive?.int?.toLong()
            app.stop()
        }

        test("a missing session cookie returns 400 invalid_request") {
            val app = testApp()

            val response = app.unassume(cookie = null, bearer = makeJwt(scope = "manage:auth"))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "missing session cookie")
            app.stop()
        }

        test("a session that is already a bare entity returns 400 invalid_request") {
            val app = testApp()

            val response = app.unassume(entityCookie(1, "eid"))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "session cookie is already a bare entity")
            app.stop()
        }

        test("an entity client can not unassume and returns 400 invalid_request") {
            val (client, partyId) = seed(Triggers.OFF) {
                val partyId = insertServiceProvider("Unassume Client SP")
                val client = insertEntityClient()
                insertPartyMembership(partyId, client.entityId)
                client to partyId
            }
            val clientEid = with(FlexPrincipal.anonymous) { repository.entityClientByClientId(client.clientId) }.shouldBeRight().externalId
            val assumed = with(FlexPrincipal("flex_entity", clientEid)) { repository.assumeParty(partyId) }.shouldBeRight()
            val partyCookie = AccessToken(
                entityId = client.entityId.toInt(),
                externalId = assumed.externalId,
                partyId = partyId.toInt(),
                role = assumed.role,
                scope = assumed.partyScopes(),
                expiryUnixSeconds = AccessToken.newExpiryUnixSeconds(),
            ).sign(TEST_JWT_SECRET)
            val app = testApp()

            val response = app.unassume(partyCookie)

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "party cannot be unassumed")
            app.stop()
        }

        test("a party token of an entity client that was deleted still can not unassume") {
            val (client, partyId) = seed(Triggers.OFF) {
                val partyId = insertServiceProvider("Deleted Client SP")
                val client = insertEntityClient()
                insertPartyMembership(partyId, client.entityId)
                client to partyId
            }
            val clientEid = with(FlexPrincipal.anonymous) { repository.entityClientByClientId(client.clientId) }.shouldBeRight().externalId
            val assumed = with(FlexPrincipal("flex_entity", clientEid)) { repository.assumeParty(partyId) }.shouldBeRight()
            val partyCookie = AccessToken(
                entityId = client.entityId.toInt(),
                externalId = assumed.externalId,
                partyId = partyId.toInt(),
                role = assumed.role,
                scope = assumed.partyScopes(),
                expiryUnixSeconds = AccessToken.newExpiryUnixSeconds(),
            ).sign(TEST_JWT_SECRET)
            seed(Triggers.OFF) { deleteEntityClient(client.id) }
            val app = testApp()

            val response = app.unassume(partyCookie)

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "party cannot be unassumed")
            app.stop()
        }

        test("an identity that does not exist returns 500 server_error") {
            val app = testApp()

            val response = app.unassume(partyCookie(1, UUID.randomUUID().toString()))

            response.status shouldBe HttpStatusCode.InternalServerError
            response.json().oauthError() shouldBe ("server_error" to "could not get entity identity")
            app.stop()
        }
    }
})

private fun seedMember() =
    seed(Triggers.OFF) {
        val entity = insertEntityIdentity("Assume Entity")
        val partyId = insertServiceProvider("Assume SP")
        insertPartyMembership(partyId, entity.entityId)
        entity to partyId
    }

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
                        val config = AuthConfig(TEST_JWT_SECRET)
                        single { AssumeHandler(config, repository) }
                        single { UnassumeHandler(config, repository) }
                    },
                )
            }
            authRoutes()
        }
    }

/** The session token of an entity that just logged in, with its default scopes. */
private fun entityCookie(entityId: Long, eid: String): String =
    AccessToken(
        entityId = entityId.toInt(),
        externalId = eid,
        partyId = 0,
        role = "flex_entity",
        scope = DefaultEntityScopes,
        expiryUnixSeconds = AccessToken.nowUnixSeconds() + SESSION_TTL_SECONDS,
    ).sign(TEST_JWT_SECRET)

/** A session token of a party, whose identity does not need to exist. */
private fun partyCookie(entityId: Long, eid: String): String =
    AccessToken(
        entityId = entityId.toInt(),
        externalId = eid,
        partyId = 1,
        role = "flex_service_provider",
        scope = DefaultEntityScopes,
        expiryUnixSeconds = AccessToken.nowUnixSeconds() + SESSION_TTL_SECONDS,
    ).sign(TEST_JWT_SECRET)

private suspend fun TestApplication.assume(
    cookie: String?,
    partyId: Any?,
    bearer: String? = null,
): HttpResponse =
    client.submitForm(
        "/auth/v1/assume",
        Parameters.build { partyId?.let { append("party_id", it.toString()) } },
    ) {
        cookie?.let { header(HttpHeaders.Cookie, "$SESSION_COOKIE=$it") }
        bearer?.let { header(HttpHeaders.Authorization, "Bearer $it") }
    }

/** Posts the form as a chunked request: there is no `Content-Length` header. */
private suspend fun TestApplication.assumeChunked(cookie: String, form: String): HttpResponse =
    client.post("/auth/v1/assume") {
        header(HttpHeaders.Cookie, "$SESSION_COOKIE=$cookie")
        setBody(ChannelWriterContent({ writeStringUtf8(form) }, ContentType.Application.FormUrlEncoded))
    }

private suspend fun TestApplication.unassume(cookie: String?, bearer: String? = null): HttpResponse =
    client.delete("/auth/v1/assume") {
        cookie?.let { header(HttpHeaders.Cookie, "$SESSION_COOKIE=$it") }
        bearer?.let { header(HttpHeaders.Authorization, "Bearer $it") }
    }

private fun HttpResponse.sessionCookie() = setCookie().first { it.name == SESSION_COOKIE }

private suspend fun HttpResponse.json(): JsonObject = Json.parseToJsonElement(bodyAsText()).jsonObject

private fun JsonObject.oauthError(): Pair<String, String> =
    getValue("error").jsonPrimitive.content to getValue("error_description").jsonPrimitive.content
