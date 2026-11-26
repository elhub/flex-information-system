package no.elhub.flex.auth.util

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.util.Base64
import java.util.Date
import java.util.UUID

/** The audience of the authorization grants in the tests: the URL of the auth API. */
const val TEST_GRANT_AUDIENCE = "https://flex.test/auth/v1/"

private const val RSA_KEY_SIZE = 2048
private const val PEM_LINE_LENGTH = 64

/** An RSA key pair, to sign authorization grants and have the public key stored in an entity client. */
class TestRsaKey(private val pair: KeyPair = generate()) {
    /** The public key in PEM format, as stored in the database. */
    val publicKeyPem: String
        get() {
            val body = Base64.getMimeEncoder(PEM_LINE_LENGTH, "\n".toByteArray()).encodeToString(pair.public.encoded)
            return "-----BEGIN PUBLIC KEY-----\n$body\n-----END PUBLIC KEY-----"
        }

    /** Signs the claims as an RS256 JWT. */
    fun sign(claims: Map<String, Any?>): String =
        JWT.create()
            .withPayload(claims.filterValues { it != null })
            .sign(Algorithm.RSA256(pair.public as RSAPublicKey, pair.private as RSAPrivateKey))

    private companion object {
        fun generate(): KeyPair = KeyPairGenerator.getInstance("RSA").apply { initialize(RSA_KEY_SIZE) }.genKeyPair()
    }
}

/**
 * Makes an authorization grant, i.e. the JWT of the JWT bearer grant, signed by [key].
 * Pass `null` as a claim to leave it out.
 */
@Suppress("LongParameterList", "MagicNumber")
fun makeGrant(
    key: TestRsaKey,
    issuer: String,
    audience: String? = TEST_GRANT_AUDIENCE,
    subject: String? = null,
    issuedAt: Date? = Date(),
    expiresAt: Date? = Date(System.currentTimeMillis() + 60_000),
    jwtId: String? = UUID.randomUUID().toString(),
): String =
    key.sign(
        mapOf(
            "iss" to issuer,
            "aud" to audience,
            "sub" to subject,
            "iat" to issuedAt?.let { it.time / 1000 },
            "exp" to expiresAt?.let { it.time / 1000 },
            "jti" to jwtId,
        ),
    )
