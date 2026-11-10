package no.elhub.flex.auth.oidc

import arrow.core.left
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.kotest.matchers.string.shouldStartWith
import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.parameter
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.Url
import io.ktor.http.parseQueryString
import io.ktor.http.setCookie
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.authRoutes
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.db.AuthRepository
import no.elhub.flex.auth.db.AuthRepositoryImpl
import no.elhub.flex.auth.plugin.configureAuthentication
import no.elhub.flex.auth.scope.DefaultEntityScopes
import no.elhub.flex.auth.token.AccessToken
import no.elhub.flex.auth.util.TEST_JWT_SECRET
import no.elhub.flex.auth.util.makeJwt
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.security.MessageDigest
import java.util.Base64
import java.util.concurrent.atomic.AtomicLong

private val pidCounter = AtomicLong(30_000_000_000L + System.nanoTime() % 1_000_000L)

private fun uniquePid(): String = pidCounter.getAndIncrement().toString()

private fun testApp(oidcProvider: OidcProvider, repository: AuthRepository): TestApplication =
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
                        single { LoginHandler(config, oidcProvider) }
                        single { CallbackHandler(config, oidcProvider, repository) }
                        single { LogoutHandler(oidcProvider) }
                    },
                )
            }
            authRoutes()
        }
    }

/** Runs [block] with a fake identity provider and an application that is set up to use it, and a client that does not follow redirects. */
private suspend fun withFlow(
    par: Boolean = true,
    endSession: Boolean = false,
    repository: AuthRepository = mockk(),
    block: suspend (FakeIdentityProvider, HttpClient) -> Unit,
) {
    val provider = FakeIdentityProvider(par, endSession).start()
    val app = testApp(OidcProvider.create(provider.config(), TEST_JWT_SECRET).shouldBeRight(), repository)
    try {
        block(provider, app.createClient { followRedirects = false })
    } finally {
        app.stop()
        provider.stop()
    }
}

private fun databaseRepository(): AuthRepository {
    PostgresTestContainer.database // makes sure that the database is up and connected to FlexTransaction
    return AuthRepositoryImpl()
}

/** What the login hands to the user and the identity provider. */
private class StartedLogin(val response: HttpResponse, val cookie: String, val state: String, val nonce: String)

private suspend fun startLogin(provider: FakeIdentityProvider, http: HttpClient, returnUrl: String? = null): StartedLogin {
    val response = http.get("/auth/v1/login") { returnUrl?.let { parameter("return_url", it) } }
    response.status shouldBe HttpStatusCode.Found
    val form = parseQueryString(provider.parRequests().last().bodyAsString)
    return StartedLogin(
        response = response,
        cookie = response.setCookie().first { it.name == LOGIN_COOKIE_NAME }.value,
        state = form["state"]!!,
        nonce = form["nonce"]!!,
    )
}

private suspend fun HttpClient.callback(
    code: String? = "the-code",
    state: String? = null,
    iss: String? = null,
    loginCookie: String? = null,
): HttpResponse =
    get("/auth/v1/callback") {
        code?.let { parameter("code", it) }
        state?.let { parameter("state", it) }
        iss?.let { parameter("iss", it) }
        loginCookie?.let { header(HttpHeaders.Cookie, "$LOGIN_COOKIE_NAME=$it") }
    }

private suspend fun HttpResponse.errorBody() = Json.parseToJsonElement(bodyAsText()).jsonObject

private fun HttpResponse.setCookies(): List<String> = headers.getAll(HttpHeaders.SetCookie).orEmpty()

private fun HttpResponse.sessionCookie(): String? =
    setCookie().firstOrNull { it.name == "__Host-flex_session" && it.value != "not.a.session" }?.value

/**
 * Logs in with an ID token that has the [claims] and the [subject], and returns what is stored about the person who
 * logged in: the business ID of the entity, its type, and the name.
 */
private suspend fun HttpClient.loginAndFindPerson(
    provider: FakeIdentityProvider,
    claims: Map<String, Any>,
    subject: String = "subject-1",
): Triple<String, String, String> {
    val login = startLogin(provider, this)
    provider.stubTokenWithIdToken(provider.idToken(nonce = login.nonce, claims = claims, subject = subject))

    val response = callback(state = login.state, loginCookie = login.cookie)

    response.status shouldBe HttpStatusCode.Found
    val token = AccessToken.parse(response.sessionCookie()!!, TEST_JWT_SECRET).shouldBeRight()
    return PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement("SELECT business_id, business_id_type, name FROM flex.entity WHERE id = ?").use { stmt ->
            stmt.setLong(1, token.entityId.toLong())
            stmt.executeQuery().use { rs ->
                rs.next()
                Triple(rs.getString("business_id"), rs.getString("business_id_type"), rs.getString("name"))
            }
        }
    }
}

class OidcRoutesTest : FunSpec({

    context("login") {
        test("sends the user to the identity provider with the pushed request, and sets the login cookie") {
            withFlow { provider, http ->
                val login = startLogin(provider, http)

                login.response.headers[HttpHeaders.Location]!! shouldStartWith "${provider.issuer}/authorize?request_uri="

                val cookie = login.response.setCookies().single { it.startsWith("$LOGIN_COOKIE_NAME=") }
                cookie shouldContain "Path=/auth/v1/callback"
                cookie shouldContain "Max-Age=600"
                cookie shouldContain "Secure"
                cookie shouldContain "HttpOnly"
                cookie shouldContain "SameSite=Lax"
            }
        }

        test("the login cookie is signed, and has what is needed to verify what the identity provider returns") {
            withFlow { provider, http ->
                val login = startLogin(provider, http)

                val cookie = LoginCookie.parse(login.cookie, TEST_JWT_SECRET).shouldBeRight()
                Verifier.fromString(TEST_JWT_SECRET, cookie.authorizationDetails.stateVerifier).shouldBeRight().verify(login.state) shouldBe true
                Verifier.fromString(TEST_JWT_SECRET, cookie.authorizationDetails.nonceVerifier).shouldBeRight().verify(login.nonce) shouldBe true
                cookie.returnUrl shouldBe "/#/login/assumeParty"
                // the verifier of the code challenge that was sent to the provider
                parseQueryString(provider.parRequests().last().bodyAsString)["code_challenge"] shouldBe
                    Base64.getUrlEncoder().withoutPadding().encodeToString(
                        MessageDigest.getInstance("SHA-256").digest(cookie.authorizationDetails.codeVerifier.toByteArray()),
                    )
            }
        }

        test("every login has its own state and nonce") {
            withFlow { provider, http ->
                val first = startLogin(provider, http)
                val second = startLogin(provider, http)

                first.state shouldNotBe second.state
                first.nonce shouldNotBe second.nonce
                first.cookie shouldNotBe second.cookie
            }
        }

        test("the return url is kept in the login cookie") {
            withFlow { provider, http ->
                val login = startLogin(provider, http, returnUrl = "/#/entity/3/show")

                LoginCookie.parse(login.cookie, TEST_JWT_SECRET).shouldBeRight().returnUrl shouldBe "/#/entity/3/show"
            }
        }

        listOf("https://evil.example/#/", "/some/path", "//evil.example", "/#").forEach { returnUrl ->
            test("a return url that is not in the frontend is rejected: '$returnUrl'") {
                withFlow { provider, http ->
                    val response = http.get("/auth/v1/login") { parameter("return_url", returnUrl) }

                    response.status shouldBe HttpStatusCode.BadRequest
                    val body = response.errorBody()
                    body["code"]?.jsonPrimitive?.content shouldBe "HTTP400"
                    body["details"]?.jsonPrimitive?.content shouldBe "return_url must be a relative path in the frontend"
                    response.setCookies() shouldBe emptyList()
                    provider.parRequests() shouldBe emptyList()
                }
            }
        }

        test("a provider without PAR gets the parameters in the redirect") {
            withFlow(par = false) { provider, http ->
                val response = http.get("/auth/v1/login")

                response.status shouldBe HttpStatusCode.Found
                val location = Url(response.headers[HttpHeaders.Location]!!)
                location.parameters["state"] shouldNotBe null
                location.parameters["code_challenge_method"] shouldBe "S256"
                location.parameters["acr_values"] shouldBe "idporten-loa-substantial"
                response.setCookie().any { it.name == LOGIN_COOKIE_NAME } shouldBe true
            }
        }

        test("a PAR that fails gets the parameters in the redirect") {
            withFlow { provider, http ->
                provider.stubPar(500)

                val response = http.get("/auth/v1/login")

                response.status shouldBe HttpStatusCode.Found
                Url(response.headers[HttpHeaders.Location]!!).parameters["state"] shouldNotBe null
            }
        }

        test("anonymous callers can log in") {
            withFlow { provider, http ->
                // an anonymous caller has no token: use:auth covers read:auth:login
                startLogin(provider, http)
            }
        }

        test("a caller with a token that covers read:auth:login can log in") {
            withFlow { _, http ->
                val response = http.get("/auth/v1/login") { header(HttpHeaders.Authorization, "Bearer ${makeJwt(scope = "read:auth:login")}") }

                response.status shouldBe HttpStatusCode.Found
            }
        }

        test("a caller with a token that does not cover read:auth:login gets 403") {
            withFlow { provider, http ->
                val response = http.get("/auth/v1/login") { header(HttpHeaders.Authorization, "Bearer ${makeJwt(scope = "read:data")}") }

                response.status shouldBe HttpStatusCode.Forbidden
                response.headers[HttpHeaders.WWWAuthenticate]!! shouldContain "insufficient_scope"
                provider.parRequests() shouldBe emptyList()
            }
        }
    }

    context("callback") {
        test("logs the person in: sets the session cookie of the entity, unsets the login cookie, and redirects to the frontend") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val pid = uniquePid()
                val login = startLogin(provider, http)
                provider.stubTokenWithIdToken(
                    provider.idToken(nonce = login.nonce, claims = mapOf("preferred_username" to pid, "name" to "Flow Person")),
                )

                val response = http.callback(state = login.state, iss = provider.issuer, loginCookie = login.cookie)

                response.status shouldBe HttpStatusCode.Found
                response.headers[HttpHeaders.Location] shouldBe "/#/login/assumeParty"

                // the session cookie
                val sessionCookie = response.setCookies().single { it.startsWith("__Host-flex_session=") }
                sessionCookie shouldContain "Path=/"
                sessionCookie shouldContain "Max-Age=3600"
                sessionCookie shouldContain "Secure"
                sessionCookie shouldContain "HttpOnly"
                sessionCookie shouldContain "SameSite=Strict"
                val token = AccessToken.parse(response.sessionCookie()!!, TEST_JWT_SECRET).shouldBeRight()
                token.role shouldBe "flex_entity"
                token.partyId shouldBe 0
                token.scope shouldBe DefaultEntityScopes

                // the entity was created from the identity of the person
                val info = with(FlexPrincipal(role = "flex_entity", eid = token.externalId)) { AuthRepositoryImpl().currentUserInfo() }.shouldBeRight()
                info.entityId shouldBe token.entityId.toLong()
                info.entityName shouldBe "Flow Person"
                info.partyId shouldBe null

                // the login cookie is used up
                val loginCookie = response.setCookies().single { it.startsWith("$LOGIN_COOKIE_NAME=") }
                loginCookie shouldContain "$LOGIN_COOKIE_NAME=not.a.login"
                loginCookie shouldContain "Max-Age=0"
                loginCookie shouldContain "Path=/auth/v1/callback"
            }
        }

        test("the code and the verifier of the login are sent to the identity provider") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val login = startLogin(provider, http)
                provider.stubTokenWithIdToken(provider.idToken(nonce = login.nonce, claims = mapOf("preferred_username" to uniquePid())))

                http.callback(code = "code-from-provider", state = login.state, loginCookie = login.cookie).status shouldBe HttpStatusCode.Found

                val form = parseQueryString(provider.tokenRequests().single().bodyAsString)
                form["code"] shouldBe "code-from-provider"
                form["code_verifier"] shouldBe LoginCookie.parse(login.cookie, TEST_JWT_SECRET).shouldBeRight().authorizationDetails.codeVerifier
            }
        }

        test("the same person gets the same entity at the next login") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val claims = mapOf("preferred_username" to uniquePid(), "name" to "Returning Person")
                val sessions = (1..2).map {
                    val login = startLogin(provider, http)
                    provider.stubTokenWithIdToken(provider.idToken(nonce = login.nonce, claims = claims))
                    val response = http.callback(state = login.state, loginCookie = login.cookie)
                    response.status shouldBe HttpStatusCode.Found
                    AccessToken.parse(response.sessionCookie()!!, TEST_JWT_SECRET).shouldBeRight()
                }

                sessions[0].entityId shouldBe sessions[1].entityId
                sessions[0].externalId shouldBe sessions[1].externalId
            }
        }

        test("emails are lowercased to find the entity") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val email = "Flow.${uniquePid()}@Example.COM"
                val sessions = listOf(email, email.lowercase()).map { username ->
                    val login = startLogin(provider, http)
                    provider.stubTokenWithIdToken(provider.idToken(nonce = login.nonce, claims = mapOf("preferred_username" to username)))
                    val response = http.callback(state = login.state, loginCookie = login.cookie)
                    AccessToken.parse(response.sessionCookie()!!, TEST_JWT_SECRET).shouldBeRight()
                }

                sessions[0].entityId shouldBe sessions[1].entityId
            }
        }

        test("redirects to the return url of the login") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val login = startLogin(provider, http, returnUrl = "/#/entity/3/show")
                provider.stubTokenWithIdToken(provider.idToken(nonce = login.nonce, claims = mapOf("preferred_username" to uniquePid())))

                val response = http.callback(state = login.state, loginCookie = login.cookie)

                response.headers[HttpHeaders.Location] shouldBe "/#/entity/3/show"
            }
        }

        test("a person that cannot get an entity is rejected as an invalid client, and does not get a session") {
            val repository = mockk<AuthRepository>()
            coEvery { with(any<FlexPrincipal>()) { repository.getOrCreateEntity(any(), any(), any()) } } returns DatabaseError("stub").left()
            withFlow(repository = repository) { provider, http ->
                val login = startLogin(provider, http)
                provider.stubTokenWithIdToken(provider.idToken(nonce = login.nonce))

                val response = http.callback(state = login.state, loginCookie = login.cookie)

                response.status shouldBe HttpStatusCode.BadRequest
                val body = response.errorBody()
                body["error"]?.jsonPrimitive?.content shouldBe "invalid_client"
                body["error_description"]?.jsonPrimitive?.content shouldBe "you are not a registered user"
                response.sessionCookie() shouldBe null
            }
        }

        context("is rejected, and gives no session,") {
            suspend fun failure(name: String, status: HttpStatusCode, detail: String, setup: suspend (FakeIdentityProvider, StartedLogin) -> CallbackArguments) =
                test(name) {
                    withFlow { provider, http ->
                        val login = startLogin(provider, http)
                        val arguments = setup(provider, login)

                        val response = http.callback(arguments.code, arguments.state, arguments.iss, arguments.cookie)

                        response.status shouldBe status
                        response.errorBody()["details"]?.jsonPrimitive?.content shouldBe detail
                        response.setCookies().none { it.startsWith("__Host-flex_session=") } shouldBe true
                    }
                }

            failure("when there is no code", HttpStatusCode.BadRequest, "no code in callback") { _, login ->
                CallbackArguments(code = null, state = login.state, cookie = login.cookie)
            }
            failure("when there is no state", HttpStatusCode.BadRequest, "no state in callback") { _, login ->
                CallbackArguments(state = null, cookie = login.cookie)
            }
            failure("when the issuer is not the one of the provider", HttpStatusCode.BadRequest, "invalid issuer in callback") { _, login ->
                CallbackArguments(state = login.state, iss = "https://evil.example", cookie = login.cookie)
            }
            failure("when there is no login cookie", HttpStatusCode.BadRequest, "missing login cookie") { _, login ->
                CallbackArguments(state = login.state, cookie = null)
            }
            failure("when the login cookie is not signed by us", HttpStatusCode.BadRequest, "invalid cookie") { _, login ->
                CallbackArguments(state = login.state, cookie = login.cookie.substringBeforeLast('.') + ".AAAA")
            }
            failure("when the login cookie is made with another secret", HttpStatusCode.BadRequest, "invalid cookie") { _, login ->
                val cookie = LoginCookie.parse(login.cookie, TEST_JWT_SECRET).shouldBeRight().toCookie("another secret").value
                CallbackArguments(state = login.state, cookie = cookie)
            }
            failure("when the state is not the one of the login", HttpStatusCode.InternalServerError, "invalid state in callback") { _, login ->
                CallbackArguments(state = Verifier.fromRandom(TEST_JWT_SECRET).hash, cookie = login.cookie)
            }
            failure("when the state is not a hash", HttpStatusCode.InternalServerError, "invalid state in callback") { _, login ->
                CallbackArguments(state = "not a hash!", cookie = login.cookie)
            }
            failure("when the token endpoint fails", HttpStatusCode.InternalServerError, "error in code exchange") { provider, login ->
                provider.stubToken(status = 400, body = """{"error":"invalid_grant"}""")
                CallbackArguments(state = login.state, cookie = login.cookie)
            }
            failure("when there is no ID token", HttpStatusCode.BadRequest, "no id_token in token response") { provider, login ->
                provider.stubToken(body = """{"access_token":"access","token_type":"Bearer"}""")
                CallbackArguments(state = login.state, cookie = login.cookie)
            }
            failure("when the ID token has another signature", HttpStatusCode.BadRequest, "invalid id_token") { provider, login ->
                provider.stubTokenWithIdToken(provider.idToken(nonce = login.nonce, signWithOtherKey = true))
                CallbackArguments(state = login.state, cookie = login.cookie)
            }
            failure("when the ID token is for another client", HttpStatusCode.BadRequest, "invalid id_token") { provider, login ->
                provider.stubTokenWithIdToken(provider.idToken(nonce = login.nonce, audience = "another-client"))
                CallbackArguments(state = login.state, cookie = login.cookie)
            }
            failure("when the ID token has no nonce", HttpStatusCode.BadRequest, "no nonce in id_token") { provider, login ->
                provider.stubTokenWithIdToken(provider.idToken(nonce = null))
                CallbackArguments(state = login.state, cookie = login.cookie)
            }
            failure("when the nonce of the ID token is not the one of the login", HttpStatusCode.InternalServerError, "invalid nonce in callback") { provider, login ->
                provider.stubTokenWithIdToken(provider.idToken(nonce = Verifier.fromRandom(TEST_JWT_SECRET).hash))
                CallbackArguments(state = login.state, cookie = login.cookie)
            }
        }

        test("a login cookie of one login cannot be used with the state of another") {
            withFlow { provider, http ->
                val first = startLogin(provider, http)
                val second = startLogin(provider, http)

                http.callback(state = second.state, loginCookie = first.cookie).status shouldBe HttpStatusCode.InternalServerError
            }
        }

        test("a caller with a token that does not cover read:auth:callback gets 403") {
            withFlow { provider, http ->
                val response = http.get("/auth/v1/callback") {
                    header(HttpHeaders.Authorization, "Bearer ${makeJwt(scope = "read:data")}")
                    parameter("code", "c")
                    parameter("state", "s")
                }

                response.status shouldBe HttpStatusCode.Forbidden
                provider.tokenRequests() shouldBe emptyList()
            }
        }
    }

    context("the person is identified from the claims of the ID token") {
        test("IDPorten: the pid claim is the identifier, and the name is made of given and family name") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val pid = uniquePid()
                val claims = mapOf("pid" to pid, "given_name" to "Ola", "family_name" to "Nordmann")

                http.loginAndFindPerson(provider, claims) shouldBe Triple(pid, "pid", "Ola Nordmann")
            }
        }

        test("IDPorten: the name is the pid when there are no name claims") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val pid = uniquePid()

                http.loginAndFindPerson(provider, mapOf("pid" to pid)) shouldBe Triple(pid, "pid", pid)
            }
        }

        test("IDPorten: only the given name is used when there is no family name") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val pid = uniquePid()

                http.loginAndFindPerson(provider, mapOf("pid" to pid, "given_name" to "Ola")) shouldBe Triple(pid, "pid", "Ola")
            }
        }

        test("Authelia: the preferred username is the identifier and the name claim is the name") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val pid = uniquePid()
                val claims = mapOf("preferred_username" to pid, "name" to "Test Suite")

                http.loginAndFindPerson(provider, claims) shouldBe Triple(pid, "pid", "Test Suite")
            }
        }

        test("Entra: an email as preferred username is lowercased and typed as email") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val email = "Ola.${uniquePid()}@Example.COM"
                val claims = mapOf("preferred_username" to email, "name" to "Ola")

                http.loginAndFindPerson(provider, claims) shouldBe Triple(email.lowercase(), "email", "Ola")
            }
        }

        test("the name is the identifier when there is no name claim") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val pid = uniquePid()

                http.loginAndFindPerson(provider, mapOf("preferred_username" to pid)) shouldBe Triple(pid, "pid", pid)
            }
        }

        test("the name is the identifier when the name claim is empty") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val pid = uniquePid()

                http.loginAndFindPerson(provider, mapOf("preferred_username" to pid, "name" to "")) shouldBe Triple(pid, "pid", pid)
            }
        }

        test("other providers: the subject is the identifier") {
            withFlow(repository = databaseRepository()) { provider, http ->
                val subject = uniquePid()

                http.loginAndFindPerson(provider, claims = emptyMap(), subject = subject) shouldBe Triple(subject, "pid", subject)
            }
        }
    }

    context("logout") {
        test("unsets the session cookie and redirects to the logout page of the identity provider (Authelia)") {
            withFlow { provider, http ->
                val response = http.get("/auth/v1/logout")

                response.status shouldBe HttpStatusCode.Found
                val location = response.headers[HttpHeaders.Location]!!
                location shouldStartWith "${provider.issuer}/logout?"
                Url(location).parameters["rd"] shouldBe TEST_POST_LOGOUT_URL
                val cookie = response.setCookies().single { it.startsWith("__Host-flex_session=") }
                cookie shouldContain "__Host-flex_session=not.a.session"
                cookie shouldContain "Max-Age=0"
                cookie shouldContain "Path=/"
                cookie shouldContain "Secure"
                cookie shouldContain "HttpOnly"
                cookie shouldContain "SameSite=Strict"
            }
        }

        test("redirects to the end session endpoint of the identity provider when it has one") {
            withFlow(endSession = true) { provider, http ->
                val response = http.get("/auth/v1/logout")

                response.status shouldBe HttpStatusCode.Found
                response.headers[HttpHeaders.Location] shouldBe "${provider.issuer}/end-session"
            }
        }

        test("works with a session cookie") {
            withFlow { _, http ->
                val response = http.get("/auth/v1/logout") { header(HttpHeaders.Cookie, "__Host-flex_session=${makeJwt(scope = "manage:auth")}") }

                response.status shouldBe HttpStatusCode.Found
                response.setCookies().single { it.startsWith("__Host-flex_session=") } shouldContain "Max-Age=0"
            }
        }

        test("a caller with a token that does not cover read:auth:logout gets 403, and the cookie is kept") {
            withFlow { _, http ->
                val response = http.get("/auth/v1/logout") { header(HttpHeaders.Authorization, "Bearer ${makeJwt(scope = "read:data")}") }

                response.status shouldBe HttpStatusCode.Forbidden
                response.setCookies() shouldBe emptyList()
                response.bodyAsText() shouldNotContain "end-session"
            }
        }
    }
})

private data class CallbackArguments(
    val code: String? = "the-code",
    val state: String? = null,
    val iss: String? = null,
    val cookie: String? = null,
)
