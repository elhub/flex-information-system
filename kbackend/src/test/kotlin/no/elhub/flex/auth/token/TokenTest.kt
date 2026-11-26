package no.elhub.flex.auth.token

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.ints.shouldBeInRange
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldStartWith
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
import io.ktor.http.contentType
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.api.config.FlexConfig
import no.elhub.flex.auth.authRoutes
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.db.AuthRepositoryImpl
import no.elhub.flex.auth.plugin.configureAuthentication
import no.elhub.flex.auth.scope.DefaultEntityScopes
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.util.TEST_GRANT_AUDIENCE
import no.elhub.flex.auth.util.TEST_JWT_SECRET
import no.elhub.flex.auth.util.TestRsaKey
import no.elhub.flex.auth.util.makeGrant
import no.elhub.flex.auth.util.makeJwt
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.testutil.SeededEntityClient
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.util.Base64
import java.util.Date
import java.util.UUID

private const val TOKEN_EXCHANGE = "urn:ietf:params:oauth:grant-type:token-exchange"
private const val JWT_BEARER = "urn:ietf:params:oauth:grant-type:jwt-bearer"
private const val JWT_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:jwt"
private const val ENTITY_TOKEN_TTL_SECONDS = 600L

private val repository = AuthRepositoryImpl()

/** `POST /auth/v1/token`: the token exchange and JWT bearer grants. */
class TokenTest : FunSpec({

    context("dispatch") {
        test("a request without grant_type returns 400 invalid_request") {
            val app = testApp()

            val response = app.postToken()

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "no grant_type in request")
            app.stop()
        }

        test("a body that is not a form is the same as no grant_type") {
            val app = testApp()

            val response = app.client.post("/auth/v1/token") {
                contentType(ContentType.Application.Json)
                setBody("""{"grant_type":"$JWT_BEARER"}""")
            }

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "no grant_type in request")
            app.stop()
        }

        test("an unsupported grant type returns 400 unsupported_grant_type") {
            val app = testApp()

            val response = app.postToken("grant_type" to "client_credentials")

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("unsupported_grant_type" to "unsupported grant type: client_credentials")
            app.stop()
        }

        test("a token that does not cover use:auth:token returns 403") {
            val app = testApp()

            val response = app.postToken("grant_type" to JWT_BEARER, bearer = makeJwt(scope = "read:data"))

            response.status shouldBe HttpStatusCode.Forbidden
            response.headers[HttpHeaders.WWWAuthenticate] shouldContain "insufficient_scope"
            app.stop()
        }
    }

    context("authentication of the caller") {
        test("an invalid token in the Authorization header returns 400 invalid_request, not 401") {
            val app = testApp()

            val response = app.exchange("not.a.jwt", "assume:party:1")

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "unable to verify and validate token")
            response.headers[HttpHeaders.WWWAuthenticate] shouldContain "invalid_token"
            app.stop()
        }

        test("an expired token in the Authorization header returns 400 invalid_request") {
            val app = testApp()

            val response = app.jwtBearer("a.b.c", bearer = makeJwt(ttlSeconds = -60, scope = "use:auth:token"))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "unable to verify and validate token")
            app.stop()
        }

        test("an Authorization header that is not a Bearer one returns 400 invalid_request") {
            val app = testApp()

            val response = app.client.submitForm(
                "/auth/v1/token",
                Parameters.build { append("grant_type", JWT_BEARER) },
            ) {
                header(HttpHeaders.Authorization, "Basic dXNlcjpwYXNz")
            }

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "missing Bearer in Authorization header")
            response.headers[HttpHeaders.WWWAuthenticate] shouldContain "invalid_request"
            app.stop()
        }

        test("a valid session cookie is not anonymous either") {
            val app = testApp()

            val response = app.client.submitForm(
                "/auth/v1/token",
                Parameters.build {
                    append("grant_type", JWT_BEARER)
                    append("assertion", "a.b.c")
                },
            ) {
                header(HttpHeaders.Cookie, "__Host-flex_session=${makeJwt(scope = "use:auth:token")}")
            }

            response.status shouldBe HttpStatusCode.Unauthorized
            response.json().oauthError() shouldBe ("invalid_client" to "client is not anonymous")
            app.stop()
        }
    }

    context("token exchange") {

        test("a member of a party gets a token for the party, with the scopes of the membership") {
            val (entity, partyId) = seed(Triggers.OFF) {
                val entity = insertEntityIdentity("Exchange Entity")
                val partyId = insertServiceProvider("Exchange SP")
                insertPartyMembership(partyId, entity.entityId)
                entity to partyId
            }
            val actorToken = entityToken(entity.entityId, entity.principal.eid)
            val app = testApp()

            val response = app.exchange(actorToken, "assume:party:$partyId")

            response.status shouldBe HttpStatusCode.OK
            val body = response.json()
            body["token_type"]?.jsonPrimitive?.content shouldBe "Bearer"
            body["issued_token_type"]?.jsonPrimitive?.content shouldBe "urn:ietf:params:oauth:token-type:access_token"
            body["expires_in"]?.jsonPrimitive?.int?.shouldBeInRange((ENTITY_TOKEN_TTL_SECONDS - 5).toInt()..ENTITY_TOKEN_TTL_SECONDS.toInt())
            val token = AccessToken.parse(body.getValue("access_token").jsonPrimitive.content, TEST_JWT_SECRET).shouldBeRight()
            token.entityId.toLong() shouldBe entity.entityId
            token.partyId shouldBe partyId.toInt()
            token.role shouldBe "flex_service_provider"
            token.scope shouldBe listOf(Scope(ScopeVerb.Manage, "auth"))
            token.expiryUnixSeconds shouldBe AccessToken.parse(actorToken, TEST_JWT_SECRET).shouldBeRight().expiryUnixSeconds
            app.stop()
        }

        test("an owner of a party gets a token for the party") {
            val (entity, so) = seed(Triggers.OFF) {
                val so = insertSystemOperator("Exchange SO")
                insertIdentityOf(so.entityId) to so
            }
            val app = testApp()

            val response = app.exchange(entityToken(entity.entityId, entity.principal.eid), "assume:party:${so.partyId}")

            response.status shouldBe HttpStatusCode.OK
            val token = AccessToken.parse(response.json().getValue("access_token").jsonPrimitive.content, TEST_JWT_SECRET).shouldBeRight()
            token.role shouldBe "flex_system_operator"
            token.partyId shouldBe so.partyId.toInt()
            token.scope shouldBe listOf(Scope(ScopeVerb.Manage, "auth"), Scope(ScopeVerb.Manage, "data"))
            app.stop()
        }

        test("a missing field returns 400 invalid_request") {
            val actorToken = actorJwt()
            val app = testApp()

            val response = app.postToken(
                "grant_type" to TOKEN_EXCHANGE,
                "actor_token" to actorToken,
                "actor_token_type" to JWT_TOKEN_TYPE,
                bearer = actorToken,
            )

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "bad token exchange request: scope is required")
            app.stop()
        }

        test("an actor token type that is not JWT returns 400 invalid_request") {
            val actorToken = actorJwt()
            val app = testApp()

            val response = app.postToken(
                "grant_type" to TOKEN_EXCHANGE,
                "actor_token" to actorToken,
                "actor_token_type" to "urn:ietf:params:oauth:token-type:id_token",
                "scope" to "assume:party:1",
                bearer = actorToken,
            )

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "invalid actor_token_type")
            app.stop()
        }

        test("an actor token that is not the token of the header returns 400 invalid_request") {
            val app = testApp()

            val response = app.exchange(
                actorToken = actorJwt(),
                scope = "assume:party:1",
                bearer = actorJwt(eid = "other"),
            )

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "actor token must match header token")
            app.stop()
        }

        test("an actor token without Authorization header returns 400 invalid_request") {
            val app = testApp()

            val response = app.exchange(actorJwt(), "assume:party:1", bearer = null)

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "actor token must match header token")
            app.stop()
        }

        test("a scope that is not assume:party:<id> returns 400 invalid_scope") {
            val app = testApp()

            listOf("read:data", "assume:party:", "assume:party:abc").forEach { scope ->
                val response = app.exchange(actorJwt(), scope)

                response.status shouldBe HttpStatusCode.BadRequest
                response.json().oauthError() shouldBe ("invalid_scope" to "invalid scope format")
            }
            app.stop()
        }

        test("an identity that does not exist returns 500 in the auth error format") {
            val app = testApp()

            val response = app.exchange(
                makeJwt(role = "flex_entity", partyId = 0, scope = "manage:auth", eid = UUID.randomUUID().toString()),
                "assume:party:1",
            )

            response.status shouldBe HttpStatusCode.InternalServerError
            val body = response.json()
            body["code"]?.jsonPrimitive?.content shouldBe "HTTP500"
            body["details"]?.jsonPrimitive?.content shouldBe "could not get entity identity in token exchange handler"
            app.stop()
        }

        test("a party that the entity can not assume returns 400 invalid_target") {
            val (entity, partyId) = seed(Triggers.OFF) { insertEntityIdentity("Stranger") to insertServiceProvider("Foreign SP") }
            val app = testApp()

            val response = app.exchange(entityToken(entity.entityId, entity.principal.eid), "assume:party:$partyId")

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_target" to "entity cannot assume requested party")
            app.stop()
        }

        test("the party 0 returns 400 invalid_target") {
            val entity = seed(Triggers.OFF) { insertEntityIdentity("Zero Entity") }
            val app = testApp()

            val response = app.exchange(entityToken(entity.entityId, entity.principal.eid), "assume:party:0")

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_target" to "entity cannot assume requested party")
            app.stop()
        }

        test("a client restricted to a party can only assume that party") {
            val (client, allowedPartyId, otherPartyId) = seed(Triggers.OFF) {
                val allowed = insertServiceProvider("Allowed SP")
                val other = insertServiceProvider("Other SP")
                val client = insertEntityClient(partyId = allowed)
                insertPartyMembership(allowed, client.entityId)
                insertPartyMembership(other, client.entityId)
                Triple(client, allowed, other)
            }
            val identity = with(FlexPrincipal.anonymous) { repository.entityClientByClientId(client.clientId) }.shouldBeRight()
            val actorToken = entityToken(client.entityId, identity.externalId)
            val app = testApp()

            val rejected = app.exchange(actorToken, "assume:party:$otherPartyId")
            val accepted = app.exchange(actorToken, "assume:party:$allowedPartyId")

            rejected.status shouldBe HttpStatusCode.BadRequest
            rejected.json().oauthError() shouldBe ("invalid_client" to "client is not allowed to assume the requested party")
            accepted.status shouldBe HttpStatusCode.OK
            app.stop()
        }
    }

    context("jwt bearer") {

        test("a client without subject gets a token for its entity, with the scopes of the client") {
            val key = TestRsaKey()
            val client = seed(Triggers.OFF) {
                insertEntityClient(scopes = listOf("manage:auth", "read:data"), publicKey = key.publicKeyPem)
            }
            val app = testApp()

            val response = app.jwtBearer(makeGrant(key, client.clientId))

            response.status shouldBe HttpStatusCode.OK
            val body = response.json()
            body["token_type"]?.jsonPrimitive?.content shouldBe "Bearer"
            body["issued_token_type"]?.jsonPrimitive?.content shouldBe "urn:ietf:params:oauth:token-type:access_token"
            body["expires_in"]?.jsonPrimitive?.int?.shouldBeInRange(3595..3600)
            val token = AccessToken.parse(body.getValue("access_token").jsonPrimitive.content, TEST_JWT_SECRET).shouldBeRight()
            token.entityId.toLong() shouldBe client.entityId
            token.partyId shouldBe 0
            token.role shouldBe "flex_entity"
            token.scope shouldBe listOf(Scope(ScopeVerb.Manage, "auth"), Scope(ScopeVerb.Read, "data"))
            app.stop()
        }

        test("a client with a subject gets a token for the party, with the scopes of the client and the membership") {
            val key = TestRsaKey()
            val (client, partyId, gln) = seed(Triggers.OFF) {
                val partyId = insertServiceProvider("Bearer SP")
                val client = insertEntityClient(scopes = listOf("manage:auth", "manage:data"), publicKey = key.publicKeyPem)
                insertPartyMembership(partyId, client.entityId)
                Triple(client, partyId, partyBusinessId(partyId))
            }
            val app = testApp()

            val response = app.jwtBearer(makeGrant(key, client.clientId, subject = "no:party:gln:$gln:service_provider"))

            response.status shouldBe HttpStatusCode.OK
            val token = AccessToken.parse(response.json().getValue("access_token").jsonPrimitive.content, TEST_JWT_SECRET).shouldBeRight()
            token.entityId.toLong() shouldBe client.entityId
            token.partyId shouldBe partyId.toInt()
            token.role shouldBe "flex_service_provider"
            token.scope shouldBe listOf(Scope(ScopeVerb.Manage, "auth"))
            app.stop()
        }

        test("a party that the entity can not assume returns 400 invalid_client") {
            val key = TestRsaKey()
            val (client, gln) = seed(Triggers.OFF) {
                insertEntityClient(publicKey = key.publicKeyPem) to partyBusinessId(insertServiceProvider("Closed SP"))
            }
            val app = testApp()

            val response = app.jwtBearer(makeGrant(key, client.clientId, subject = "no:party:gln:$gln:service_provider"))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_client" to "could not assume the requested party in sub")
            app.stop()
        }

        test("a client restricted to a party can only assume that party") {
            val key = TestRsaKey()
            val (client, otherGln) = seed(Triggers.OFF) {
                val allowed = insertServiceProvider("Allowed SP")
                val other = insertServiceProvider("Other SP")
                val client = insertEntityClient(partyId = allowed, publicKey = key.publicKeyPem)
                insertPartyMembership(allowed, client.entityId)
                insertPartyMembership(other, client.entityId)
                client to partyBusinessId(other)
            }
            val app = testApp()

            val response = app.jwtBearer(makeGrant(key, client.clientId, subject = "no:party:gln:$otherGln:service_provider"))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_client" to "client is not allowed to assume the requested party")
            app.stop()
        }

        test("an owner of a party gets a token for the party, with the scopes of the client only") {
            val key = TestRsaKey()
            val (client, gln) = seed(Triggers.OFF) {
                val so = insertSystemOperator("Bearer Owned SO")
                val client = insertEntityClient(
                    entityId = so.entityId,
                    scopes = listOf("use:data", "manage:auth"),
                    publicKey = key.publicKeyPem,
                )
                client to partyBusinessId(so.partyId)
            }
            val app = testApp()

            val response = app.jwtBearer(makeGrant(key, client.clientId, subject = "no:party:gln:$gln:system_operator"))

            response.status shouldBe HttpStatusCode.OK
            val token = AccessToken.parse(response.json().getValue("access_token").jsonPrimitive.content, TEST_JWT_SECRET).shouldBeRight()
            token.role shouldBe "flex_system_operator"
            token.scope.toSet() shouldBe setOf(Scope(ScopeVerb.Use, "data"), Scope(ScopeVerb.Manage, "auth"))
            app.stop()
        }

        test("a party that does not exist returns 400 invalid_client") {
            val key = TestRsaKey()
            val client = seed(Triggers.OFF) { insertEntityClient(publicKey = key.publicKeyPem) }
            val app = testApp()

            val response = app.jwtBearer(makeGrant(key, client.clientId, subject = "no:party:gln:1337121312322:service_provider"))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_client" to "could not assume the requested party in sub")
            app.stop()
        }

        test("a caller with a token returns 401 invalid_client") {
            val key = TestRsaKey()
            val client = seed(Triggers.OFF) { insertEntityClient(publicKey = key.publicKeyPem) }
            val app = testApp()

            val response = app.jwtBearer(makeGrant(key, client.clientId), bearer = makeJwt(scope = "use:auth:token"))

            response.status shouldBe HttpStatusCode.Unauthorized
            response.json().oauthError() shouldBe ("invalid_client" to "client is not anonymous")
            app.stop()
        }

        test("a missing assertion returns 400 invalid_request") {
            val app = testApp()

            val response = app.postToken("grant_type" to JWT_BEARER)

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "bad jwt bearer request: assertion is required")
            app.stop()
        }

        test("an assertion that is not a JWT in compact form returns 400 invalid_request") {
            val app = testApp()

            listOf("a.b", "a.b.c.d", "abc").forEach { assertion ->
                val response = app.jwtBearer(assertion)

                response.status shouldBe HttpStatusCode.BadRequest
                response.json().oauthError() shouldBe ("invalid_request" to "assertion is not signed jwt in compact form")
            }
            app.stop()
        }

        test("an assertion whose payload is not base64 returns 400 invalid_request") {
            val app = testApp()

            val response = app.jwtBearer("a.!!!.c")

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "invalid base64 encoding in assertion payload")
            app.stop()
        }

        test("an assertion whose payload is not a grant returns 400 invalid_request") {
            val app = testApp()

            val response = app.jwtBearer("a.${base64Url("nope")}.c")

            response.status shouldBe HttpStatusCode.BadRequest
            val (error, description) = response.json().oauthError()
            error shouldBe "invalid_request"
            description shouldStartWith "invalid assertion payload format: "
            app.stop()
        }

        test("an invalid subject returns 400 invalid_request") {
            val app = testApp()

            val response = app.jwtBearer(makeGrant(TestRsaKey(), UUID.randomUUID().toString(), subject = "nope"))

            response.status shouldBe HttpStatusCode.BadRequest
            val (error, description) = response.json().oauthError()
            error shouldBe "invalid_request"
            description shouldStartWith "invalid assertion payload format: invalid subject"
            app.stop()
        }

        test("invalid claims return 400 invalid_request with all the problems") {
            val app = testApp()

            val response = app.jwtBearer(
                makeGrant(TestRsaKey(), "not-a-uuid", audience = null, jwtId = null, expiresAt = Date(System.currentTimeMillis() + 300_000)),
            )

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe (
                "invalid_request" to
                    "invalid assertion payload: aud is empty, iss is not a valid UUID, maximum lifetime is 120 seconds, jti is empty"
                )
            app.stop()
        }

        test("an audience that is not the auth API returns 400 invalid_request") {
            val app = testApp()

            val response = app.jwtBearer(makeGrant(TestRsaKey(), UUID.randomUUID().toString(), audience = "https://elsewhere.test/"))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "assertion audience is not $TEST_GRANT_AUDIENCE")
            app.stop()
        }

        test("an audience that differs from the auth API only by the trailing slash returns 400 invalid_request") {
            val app = testApp()

            val response = app.jwtBearer(makeGrant(TestRsaKey(), UUID.randomUUID().toString(), audience = TEST_GRANT_AUDIENCE.removeSuffix("/")))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_request" to "assertion audience is not $TEST_GRANT_AUDIENCE")
            app.stop()
        }

        test("an empty issuer returns 400 invalid_request") {
            val app = testApp()

            val response = app.jwtBearer(makeGrant(TestRsaKey(), ""))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError().first shouldBe "invalid_request"
            app.stop()
        }

        test("an unknown client returns 400 invalid_client") {
            val app = testApp()

            val response = app.jwtBearer(makeGrant(TestRsaKey(), UUID.randomUUID().toString()))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_client" to "invalid or unknown client")
            app.stop()
        }

        test("a client without public key returns 400 invalid_client") {
            val client = seed(Triggers.OFF) { insertEntityClient(publicKey = null) }
            val app = testApp()

            val response = app.jwtBearer(makeGrant(TestRsaKey(), client.clientId))

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().oauthError() shouldBe ("invalid_client" to "invalid or unknown client")
            app.stop()
        }

        test("an assertion signed with another key returns 400 invalid_request") {
            val client: SeededEntityClient = seed(Triggers.OFF) { insertEntityClient(publicKey = TestRsaKey().publicKeyPem) }
            val app = testApp()

            val response = app.jwtBearer(makeGrant(TestRsaKey(), client.clientId))

            response.status shouldBe HttpStatusCode.BadRequest
            val (error, description) = response.json().oauthError()
            error shouldBe "invalid_request"
            description shouldStartWith "could not verify assertion: key or payload is invalid: "
            app.stop()
        }
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
                        single {
                            TokenHandler(
                                AuthConfig(TEST_JWT_SECRET),
                                FlexConfig("Europe/Oslo", "https://flex.test/"),
                                repository,
                            )
                        }
                    },
                )
            }
            authRoutes()
        }
    }

/** A token of an entity that is allowed to call the token endpoint, whose identity does not need to exist. */
private fun actorJwt(eid: String = "12345678901"): String =
    makeJwt(role = "flex_entity", partyId = 0, scope = "use:auth:token", eid = eid)

/** An entity token like the one the session cookie carries, with the scopes of an entity that just logged in. */
private fun entityToken(entityId: Long, eid: String): String =
    AccessToken(
        entityId = entityId.toInt(),
        externalId = eid,
        partyId = 0,
        role = "flex_entity",
        scope = DefaultEntityScopes,
        expiryUnixSeconds = System.currentTimeMillis() / 1000 + ENTITY_TOKEN_TTL_SECONDS,
    ).sign(TEST_JWT_SECRET)

private suspend fun TestApplication.postToken(vararg fields: Pair<String, String>, bearer: String? = null): HttpResponse =
    client.submitForm(
        "/auth/v1/token",
        Parameters.build { fields.forEach { (name, value) -> append(name, value) } },
    ) {
        bearer?.let { header(HttpHeaders.Authorization, "Bearer $it") }
    }

/** Posts a token exchange, with [actorToken] in the body and by default also in the Authorization header. */
private suspend fun TestApplication.exchange(actorToken: String, scope: String, bearer: String? = actorToken): HttpResponse =
    postToken(
        "grant_type" to TOKEN_EXCHANGE,
        "actor_token" to actorToken,
        "actor_token_type" to JWT_TOKEN_TYPE,
        "scope" to scope,
        bearer = bearer,
    )

private suspend fun TestApplication.jwtBearer(assertion: String, bearer: String? = null): HttpResponse =
    postToken("grant_type" to JWT_BEARER, "assertion" to assertion, bearer = bearer)

private suspend fun HttpResponse.json(): JsonObject = Json.parseToJsonElement(bodyAsText()).jsonObject

private fun JsonObject.oauthError(): Pair<String, String> =
    getValue("error").jsonPrimitive.content to getValue("error_description").jsonPrimitive.content

private fun base64Url(value: String): String = Base64.getUrlEncoder().withoutPadding().encodeToString(value.toByteArray())
