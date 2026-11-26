package no.elhub.flex.auth.oidc

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.kotest.matchers.string.shouldStartWith
import io.kotest.matchers.types.shouldBeInstanceOf
import io.ktor.http.Url
import io.ktor.http.parseQueryString
import java.util.Base64
import java.util.Date

// the example of RFC 7636 appendix B
private const val RFC_7636_VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
private const val RFC_7636_CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

private const val HASH_KEY = "hash key"

private fun basic(user: String, password: String) = "Basic " + Base64.getEncoder().encodeToString("$user:$password".toByteArray())

private suspend fun <T> withProvider(
    par: Boolean = true,
    endSession: Boolean = false,
    block: suspend (FakeIdentityProvider, OidcProvider) -> T,
): T {
    val provider = FakeIdentityProvider(par, endSession).start()
    try {
        return block(provider, OidcProvider.create(provider.config(), HASH_KEY).shouldBeRight())
    } finally {
        provider.stop()
    }
}

class OidcProviderTest : FunSpec({

    context("discovery") {
        test("reads the issuer of the provider, also when the configured one has a trailing slash") {
            val provider = FakeIdentityProvider().start()
            try {
                OidcProvider.create(provider.config(provider.issuer + "/"), HASH_KEY).shouldBeRight().issuer shouldBe provider.issuer
            } finally {
                provider.stop()
            }
        }

        test("fails when the discovery endpoint responds with an error") {
            val provider = FakeIdentityProvider().start()
            try {
                provider.stubDiscovery(500)
                OidcProvider.create(provider.config(), HASH_KEY).shouldBeLeft().shouldBeInstanceOf<DiscoveryError>()
            } finally {
                provider.stop()
            }
        }

        test("fails when the provider is unreachable") {
            val provider = FakeIdentityProvider().start()
            val config = provider.config()
            provider.stop()

            OidcProvider.create(config, HASH_KEY).shouldBeLeft().shouldBeInstanceOf<DiscoveryError>()
        }
    }

    context("authUrl") {
        test("pushes the authorization request and sends the user to the authorization endpoint with the request URI") {
            withProvider { provider, client ->
                val (url, _) = client.authUrl()

                val parsed = Url(url)
                url shouldStartWith "${provider.issuer}/authorize?"
                parsed.parameters.names() shouldBe setOf("request_uri", "client_id")
                parsed.parameters["request_uri"] shouldBe "urn:test:request-1"
                parsed.parameters["client_id"] shouldBe TEST_CLIENT_ID
            }
        }

        test("the pushed request has the client authentication and all the parameters of the authorization request") {
            withProvider { provider, client ->
                val (_, details) = client.authUrl()

                val request = provider.parRequests().single()
                request.getHeader("Authorization") shouldBe basic(TEST_CLIENT_ID, TEST_CLIENT_SECRET)
                val form = parseQueryString(request.bodyAsString)
                form["response_type"] shouldBe "code"
                form["client_id"] shouldBe TEST_CLIENT_ID
                form["redirect_uri"] shouldBe TEST_REDIRECT_URL
                form["scope"] shouldBe "openid profile"
                form["acr_values"] shouldBe "idporten-loa-substantial"
                form["code_challenge_method"] shouldBe "S256"
                form["code_challenge"] shouldBe OidcProvider.codeChallenge(details.codeVerifier)
                // the state and the nonce that were sent are the ones that the details can verify
                client.verify(details.stateVerifier, form["state"]!!).shouldBeRight()
                client.verify(details.nonceVerifier, form["nonce"]!!).shouldBeRight()
            }
        }

        test("the state and the nonce are not verified with the message of the other") {
            withProvider { provider, client ->
                val (_, details) = client.authUrl()

                val form = parseQueryString(provider.parRequests().single().bodyAsString)
                client.verify(details.stateVerifier, form["nonce"]!!).shouldBeLeft() shouldBe HashMismatchError
                client.verify(details.nonceVerifier, form["state"]!!).shouldBeLeft() shouldBe HashMismatchError
            }
        }

        test("every call has its own state, nonce and code verifier") {
            withProvider { _, client ->
                val first = client.authUrl().second
                val second = client.authUrl().second

                first.stateVerifier shouldNotBe second.stateVerifier
                first.nonceVerifier shouldNotBe second.nonceVerifier
                first.codeVerifier shouldNotBe second.codeVerifier
                // 43 to 128 characters of the unreserved set, see RFC 7636
                (first.codeVerifier.length in 43..128) shouldBe true
                Regex("[A-Za-z0-9\\-._~]+").matches(first.codeVerifier) shouldBe true
            }
        }

        test("falls back to the regular authorization request when the PAR endpoint responds with an error") {
            withProvider { provider, client ->
                provider.stubPar(400, """{"error":"invalid_request"}""")

                val (url, details) = client.authUrl()

                val parsed = Url(url)
                parsed.parameters["request_uri"] shouldBe null
                client.verify(details.stateVerifier, parsed.parameters["state"]!!).shouldBeRight()
                client.verify(details.nonceVerifier, parsed.parameters["nonce"]!!).shouldBeRight()
            }
        }

        test("falls back to the regular authorization request when the PAR response is not what is expected") {
            withProvider { provider, client ->
                provider.stubPar(201, "not json")

                Url(client.authUrl().first).parameters["request_uri"] shouldBe null
            }
        }

        test("the regular authorization request has all the parameters when the provider has no PAR endpoint") {
            withProvider(par = false) { provider, client ->
                val (url, details) = client.authUrl()

                url shouldStartWith "${provider.issuer}/authorize?"
                val parameters = Url(url).parameters
                parameters["response_type"] shouldBe "code"
                parameters["client_id"] shouldBe TEST_CLIENT_ID
                parameters["redirect_uri"] shouldBe TEST_REDIRECT_URL
                parameters["scope"] shouldBe "openid profile"
                client.verify(details.stateVerifier, parameters["state"]!!).shouldBeRight()
                client.verify(details.nonceVerifier, parameters["nonce"]!!).shouldBeRight()
                parameters["acr_values"] shouldBe "idporten-loa-substantial"
                parameters["code_challenge"] shouldBe OidcProvider.codeChallenge(details.codeVerifier)
                parameters["code_challenge_method"] shouldBe "S256"
                provider.parRequests() shouldBe emptyList()
            }
        }
    }

    test("the code challenge is the S256 of the code verifier, as in the example of RFC 7636 appendix B") {
        OidcProvider.codeChallenge(RFC_7636_VERIFIER) shouldBe RFC_7636_CHALLENGE
    }

    context("verify") {
        test("fails for a message that is not valid") {
            withProvider { _, client ->
                client.verify("not base64!", "hash").shouldBeLeft().shouldBeInstanceOf<MalformedMessageError>()
            }
        }
    }

    context("exchange") {
        test("sends the code and the verifier with the client authentication, and returns the ID token") {
            withProvider { provider, client ->
                provider.stubTokenWithIdToken("the.id.token")

                client.exchange("the-code", "the-verifier").shouldBeRight().idToken shouldBe "the.id.token"

                val request = provider.tokenRequests().single()
                request.getHeader("Authorization") shouldBe basic(TEST_CLIENT_ID, TEST_CLIENT_SECRET)
                val form = request.bodyAsString.let(::parseQueryString)
                form["grant_type"] shouldBe "authorization_code"
                form["code"] shouldBe "the-code"
                form["code_verifier"] shouldBe "the-verifier"
                form["redirect_uri"] shouldBe TEST_REDIRECT_URL
            }
        }

        test("returns null when the response has no ID token") {
            withProvider { provider, client ->
                provider.stubToken(body = """{"access_token":"access","token_type":"Bearer"}""")

                client.exchange("code", "verifier").shouldBeRight().idToken shouldBe null
            }
        }

        test("fails when the token endpoint responds with an error") {
            withProvider { provider, client ->
                provider.stubToken(400, """{"error":"invalid_grant"}""")

                client.exchange("code", "verifier").shouldBeLeft().shouldBeInstanceOf<TokenExchangeError>()
            }
        }

        test("fails when the response is not what is expected") {
            withProvider { provider, client ->
                provider.stubToken(body = "not json")

                client.exchange("code", "verifier").shouldBeLeft().shouldBeInstanceOf<TokenExchangeError>()
            }
        }
    }

    context("verifyIdToken") {
        test("accepts a valid token") {
            withProvider { provider, client ->
                val verified = client.verifyIdToken(provider.idToken(nonce = "the-nonce")).shouldBeRight()

                verified.getClaim("nonce").asString() shouldBe "the-nonce"
                verified.issuer shouldBe provider.issuer
            }
        }

        test("rejects a token of another issuer") {
            withProvider { provider, client ->
                client.verifyIdToken(provider.idToken(issuer = "https://evil.example")).shouldBeLeft().shouldBeInstanceOf<InvalidIdTokenError>()
            }
        }

        test("rejects a token for another audience") {
            withProvider { provider, client ->
                client.verifyIdToken(provider.idToken(audience = "another-client")).shouldBeLeft().shouldBeInstanceOf<InvalidIdTokenError>()
            }
        }

        test("rejects an expired token") {
            withProvider { provider, client ->
                client.verifyIdToken(provider.idToken(expiresInSeconds = -60)).shouldBeLeft().shouldBeInstanceOf<InvalidIdTokenError>()
            }
        }

        test("rejects a token signed with another key") {
            withProvider { provider, client ->
                client.verifyIdToken(provider.idToken(signWithOtherKey = true)).shouldBeLeft().shouldBeInstanceOf<InvalidIdTokenError>()
            }
        }

        test("rejects a token signed with a key that the provider does not have") {
            withProvider { provider, client ->
                client.verifyIdToken(provider.idToken(keyId = "unknown-key")).shouldBeLeft().shouldBeInstanceOf<InvalidIdTokenError>()
            }
        }

        test("rejects an unsigned token") {
            withProvider { provider, client ->
                val unsigned = JWT.create().withIssuer(provider.issuer).withAudience(TEST_CLIENT_ID)
                    .withExpiresAt(Date(System.currentTimeMillis() + 60_000)).sign(Algorithm.none())

                client.verifyIdToken(unsigned).shouldBeLeft().shouldBeInstanceOf<InvalidIdTokenError>()
            }
        }

        test("rejects a token signed with HMAC, whatever the secret") {
            withProvider { provider, client ->
                val hmac = JWT.create().withKeyId(provider.keyId).withIssuer(provider.issuer).withAudience(TEST_CLIENT_ID)
                    .withExpiresAt(Date(System.currentTimeMillis() + 60_000)).sign(Algorithm.HMAC256(TEST_CLIENT_SECRET))

                client.verifyIdToken(hmac).shouldBeLeft().shouldBeInstanceOf<InvalidIdTokenError>()
            }
        }

        test("rejects something that is not a token") {
            withProvider { _, client ->
                client.verifyIdToken("not a token").shouldBeLeft().shouldBeInstanceOf<InvalidIdTokenError>()
            }
        }

        test("fails as a key set error, not as an invalid token, when the keys cannot be read") {
            withProvider { provider, client ->
                val token = provider.idToken()
                provider.stop()

                client.verifyIdToken(token).shouldBeLeft().shouldBeInstanceOf<KeySetError>()
            }
        }
    }

    context("endSessionUrl") {
        test("is the end session endpoint of the provider when it has one") {
            withProvider(endSession = true) { provider, client ->
                client.endSessionUrl() shouldBe "${provider.issuer}/end-session"
            }
        }

        test("is the logout page of the provider with the redirect when it has no end session endpoint (Authelia)") {
            withProvider(endSession = false) { provider, client ->
                val url = client.endSessionUrl()

                url shouldStartWith "${provider.issuer}/logout?"
                Url(url).parameters["rd"] shouldBe TEST_POST_LOGOUT_URL
                url shouldNotContain "#"
                url shouldContain "rd=https%3A%2F%2Fflex.test%2F%23%2Flogin"
            }
        }
    }
})
