package no.elhub.flex.auth.oidc

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.github.tomakehurst.wiremock.WireMockServer
import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.post
import com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig
import com.github.tomakehurst.wiremock.verification.LoggedRequest
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.util.Base64
import java.util.Date

const val TEST_CLIENT_ID = "flex-client"
const val TEST_CLIENT_SECRET = "flex-secret"
const val TEST_REDIRECT_URL = "https://flex.test/auth/v1/callback"
const val TEST_POST_LOGOUT_URL = "https://flex.test/#/login"

private fun generateKeyPair(): KeyPair = KeyPairGenerator.getInstance("RSA").apply { initialize(2048) }.generateKeyPair()

/**
 * An identity provider on a WireMock server: discovery, PAR, token and JWKS endpoints, with a generated signing key.
 *
 * @param par whether the discovery document advertises a PAR endpoint
 * @param endSession whether the discovery document advertises an end session endpoint
 */
@Suppress("TooManyFunctions")
class FakeIdentityProvider(private val par: Boolean = true, private val endSession: Boolean = false) {
    private val server = WireMockServer(wireMockConfig().dynamicPort())
    private val keyPair = generateKeyPair()
    private val otherKeyPair = generateKeyPair()

    val keyId = "test-key"

    /** The issuer: this is how the provider identifies itself, so there is no trailing slash. */
    val issuer: String get() = server.baseUrl()

    fun config(issuerUrl: String = issuer) = OidcConfig(
        issuer = issuerUrl,
        clientId = TEST_CLIENT_ID,
        clientSecret = TEST_CLIENT_SECRET,
        redirectUrl = TEST_REDIRECT_URL,
        postLogoutRedirectUrl = TEST_POST_LOGOUT_URL,
    )

    fun start(): FakeIdentityProvider {
        server.start()
        server.stubFor(get(urlEqualTo("/.well-known/openid-configuration")).willReturn(json(discoveryDocument())))
        server.stubFor(get(urlEqualTo("/jwks")).willReturn(json(jwks())))
        server.stubFor(post(urlEqualTo("/par")).willReturn(json("""{"request_uri":"urn:test:request-1","expires_in":60}""").withStatus(201)))
        return this
    }

    fun stop() = server.stop()

    fun stubDiscovery(status: Int) =
        server.stubFor(get(urlEqualTo("/.well-known/openid-configuration")).willReturn(aResponse().withStatus(status)))

    fun stubPar(status: Int, body: String = "{}") =
        server.stubFor(post(urlEqualTo("/par")).willReturn(json(body).withStatus(status)))

    fun stubToken(status: Int = 200, body: String) =
        server.stubFor(post(urlEqualTo("/token")).willReturn(json(body).withStatus(status)))

    fun stubTokenWithIdToken(idToken: String) = stubToken(body = """{"access_token":"access","token_type":"Bearer","id_token":"$idToken"}""")

    fun parRequests(): List<LoggedRequest> = server.findAll(postRequestedFor(urlEqualTo("/par")))

    fun tokenRequests(): List<LoggedRequest> = server.findAll(postRequestedFor(urlEqualTo("/token")))

    /**
     * An ID token for the client, by default valid and signed with the key of the provider. Claims given in [claims]
     * replace the default ones.
     */
    fun idToken(
        nonce: String? = null,
        claims: Map<String, Any> = mapOf("preferred_username" to "test-user", "name" to "Test User"),
        issuer: String = this.issuer,
        audience: String = TEST_CLIENT_ID,
        subject: String = "subject-1",
        expiresInSeconds: Long = 300,
        keyId: String? = this.keyId,
        signWithOtherKey: Boolean = false,
    ): String {
        val key = if (signWithOtherKey) otherKeyPair else keyPair
        return JWT.create()
            .apply { keyId?.let { withKeyId(it) } }
            .withIssuer(issuer)
            .withAudience(audience)
            .withSubject(subject)
            .withIssuedAt(Date())
            .withExpiresAt(Date(System.currentTimeMillis() + expiresInSeconds * 1000))
            .apply {
                nonce?.let { withClaim("nonce", it) }
                claims.forEach { (name, value) -> withClaim(name, value.toString()) }
            }
            .sign(Algorithm.RSA256(key.public as RSAPublicKey, key.private as RSAPrivateKey))
    }

    private fun json(body: String) = aResponse().withHeader("Content-Type", "application/json").withBody(body)

    private fun discoveryDocument(): String =
        buildList {
            add(""""issuer":"$issuer"""")
            add(""""authorization_endpoint":"$issuer/authorize"""")
            add(""""token_endpoint":"$issuer/token"""")
            add(""""jwks_uri":"$issuer/jwks"""")
            if (par) add(""""pushed_authorization_request_endpoint":"$issuer/par"""")
            if (endSession) add(""""end_session_endpoint":"$issuer/end-session"""")
        }.joinToString(",", "{", "}")

    private fun jwks(): String {
        val public = keyPair.public as RSAPublicKey
        val encoder = Base64.getUrlEncoder().withoutPadding()

        // BigInteger.toByteArray() has a leading zero byte when the highest bit is set, which is not part of the JWK value
        fun ByteArray.unsigned() = if (isNotEmpty() && this[0] == 0.toByte()) copyOfRange(1, size) else this
        val n = encoder.encodeToString(public.modulus.toByteArray().unsigned())
        val e = encoder.encodeToString(public.publicExponent.toByteArray().unsigned())
        return """{"keys":[{"kty":"RSA","use":"sig","alg":"RS256","kid":"$keyId","n":"$n","e":"$e"}]}"""
    }
}
