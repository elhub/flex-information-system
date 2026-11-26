package no.elhub.flex.auth.oidc

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import com.auth0.jwk.JwkException
import com.auth0.jwk.JwkProvider
import com.auth0.jwk.JwkProviderBuilder
import com.auth0.jwk.SigningKeyNotFoundException
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.DecodedJWT
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.client.HttpClient
import io.ktor.client.engine.apache5.Apache5
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.basicAuth
import io.ktor.client.request.forms.submitForm
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.http.Parameters
import io.ktor.http.URLBuilder
import io.ktor.http.isSuccess
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.net.URI
import java.net.URLEncoder
import java.security.MessageDigest
import java.security.SecureRandom
import java.security.interfaces.RSAPublicKey
import java.util.Base64

private val logger = KotlinLogging.logger {}

/** The timeout of the requests to the OIDC provider. */
private const val OIDC_TIMEOUT_SECONDS = 10

private const val SCOPES = "openid profile"
private const val ACR_VALUES = "idporten-loa-substantial"

/** We assume and support only RS256, which is what we see in the IDPs at time of writing. */
private const val ID_TOKEN_ALGORITHM = "RS256"

private const val CODE_VERIFIER_BYTES = 32

private val json = Json { ignoreUnknownKeys = true }
private val base64Url = Base64.getUrlEncoder().withoutPadding()

/** The OIDC details from the discovery endpoint. */
@Serializable
data class OpenidConfiguration(
    val issuer: String,
    @SerialName("pushed_authorization_request_endpoint") val parEndpoint: String? = null,
    @SerialName("authorization_endpoint") val authorizationEndpoint: String,
    @SerialName("end_session_endpoint") val endSessionEndpoint: String? = null,
    @SerialName("jwks_uri") val jwksUri: String,
    @SerialName("token_endpoint") val tokenEndpoint: String,
)

/** State, nonce and code verifier from a pushed authorization request. */
data class AuthorizationDetails(
    val stateVerifier: String,
    val nonceVerifier: String,
    val codeVerifier: String,
)

/** The response of the token endpoint. Only the ID token is of interest. */
@Serializable
data class TokenResponse(@SerialName("id_token") val idToken: String? = null)

/** The response of the PAR endpoint. */
@Serializable
private data class ParResponse(@SerialName("request_uri") val requestUri: String)

/**
 * A complete OIDC provider configuration.
 * It is discovered via the OIDC discovery endpoint.
 * For production this is https://idporten.no/.well-known/openid-configuration
 */
class OidcProvider private constructor(
    private val config: OidcConfig,
    /** The key used in HMAC hashing of the state and nonce. */
    private val hashKey: String,
    private val configuration: OpenidConfiguration,
    private val http: HttpClient,
    private val jwks: JwkProvider,
) {
    /** The issuer URL. */
    val issuer: String get() = configuration.issuer

    /** The client ID. */
    val clientId: String get() = config.clientId

    /**
     * Pushes an authorization request.
     * If a PAR endpoint is not available, the regular authorization endpoint is used.
     * Returns the URL, and the generated nonce and state.
     */
    suspend fun authUrl(): Pair<String, AuthorizationDetails> {
        val codeVerifier = newCodeVerifier()
        val codeChallenge = codeChallenge(codeVerifier)

        val stateVerifier = Verifier.fromRandom(hashKey)
        val state = stateVerifier.hash

        val nonceVerifier = Verifier.fromRandom(hashKey)
        val nonce = nonceVerifier.hash

        val authorizationDetails = AuthorizationDetails(
            stateVerifier.message,
            nonceVerifier.message,
            codeVerifier,
        )

        val pushedAuthUrl = configuration.parEndpoint?.let { parEndpoint ->
            parRequest(parEndpoint, state, nonce, codeChallenge)
                .onLeft { logger.warn { "${it.message}, falling back to the regular authorization request" } }
                .getOrNull()
        }

        // Fall back to regular front-channel
        val authUrl = pushedAuthUrl ?: URLBuilder(configuration.authorizationEndpoint).apply {
            parameters.append("response_type", "code")
            parameters.append("client_id", config.clientId)
            parameters.append("redirect_uri", config.redirectUrl)
            parameters.append("scope", SCOPES)
            parameters.append("state", state)
            parameters.append("nonce", nonce)
            parameters.append("acr_values", ACR_VALUES)
            parameters.append("code_challenge", codeChallenge)
            parameters.append("code_challenge_method", "S256")
        }.buildString()

        return authUrl to authorizationDetails
    }

    /** Returns the end session URL with query parameters. */
    fun endSessionUrl(): String {
        val endSessionEndpoint = configuration.endSessionEndpoint

        if (endSessionEndpoint.isNullOrEmpty()) {
            // fallback for authelia
            return URLBuilder("${configuration.issuer}/logout").apply {
                parameters.append("rd", config.postLogoutRedirectUrl)
            }.buildString()
        }

        // TODO add params. This requires the id_token_hint which we currently don't store for the session.
        // So currently we just rely on the default sign out.
        // parameters.append("post_logout_redirect_uri", postLogoutRedirectUrl)
        // parameters.append("id_token_hint", TODOgetidtoken)
        return endSessionEndpoint
    }

    /** Exchanges a code for a token. */
    suspend fun exchange(code: String, verifier: String): Either<TokenExchangeError, TokenResponse> =
        either {
            val response = Either.catch {
                http.submitForm(
                    configuration.tokenEndpoint,
                    Parameters.build {
                        append("grant_type", "authorization_code")
                        append("code", code)
                        append("redirect_uri", config.redirectUrl)
                        append("code_verifier", verifier)
                    },
                ) {
                    // the client credentials are form-encoded before the encoding of the header,
                    // see RFC 6749 section 2.3.1
                    basicAuth(
                        formEncode(config.clientId),
                        formEncode(config.clientSecret),
                    )
                }
            }.mapLeft { TokenExchangeError("could not call the token endpoint: ${it.message}") }.bind()

            ensure(response.status.isSuccess()) {
                TokenExchangeError("the token endpoint responded with ${response.status}")
            }

            Either.catch { json.decodeFromString<TokenResponse>(response.bodyAsText()) }
                .mapLeft { TokenExchangeError("could not decode the token response: ${it.message}") }
                .bind()
        }

    /**
     * Verifies the ID token and returns it: signature with the key set of the provider, issuer, audience and expiry.
     */
    suspend fun verifyIdToken(idToken: String): Either<IdTokenError, DecodedJWT> =
        either {
            val decoded = Either.catch { JWT.decode(idToken) }
                .mapLeft { InvalidIdTokenError("the token is malformed") }
                .bind()

            ensure(decoded.algorithm == ID_TOKEN_ALGORITHM) {
                InvalidIdTokenError("unsupported algorithm ${decoded.algorithm}")
            }

            val key =
                Either.catch { withContext(Dispatchers.IO) { jwks.get(decoded.keyId).publicKey } }
                    .mapLeft { e ->
                        if (
                            e is JwkException &&
                            generateSequence<Throwable>(e) { it.cause }.last() is SigningKeyNotFoundException
                        ) {
                            InvalidIdTokenError("no signing key matches the token")
                        } else {
                            KeySetError("could not get key set: ${e.message}")
                        }
                    }
                    .bind()

            val rsaKey = key as? RSAPublicKey ?: raise(InvalidIdTokenError("the signing key is not an RSA key"))

            Either.catch {
                JWT.require(Algorithm.RSA256(rsaKey, null))
                    .withIssuer(configuration.issuer)
                    .withAudience(config.clientId)
                    .build()
                    .verify(decoded)
            }.mapLeft { InvalidIdTokenError(it.message ?: "the token could not be verified") }.bind()
        }

    /** Verifies a nonce or state. It errors if it cannot decode the [message]. */
    fun verify(message: String, hash: String): Either<VerificationError, Unit> =
        either {
            val verifier = Verifier.fromString(hashKey, message).bind()
            ensure(verifier.verify(hash)) { HashMismatchError }
        }

    /** Returns the authorization URL, for the request pushed to the PAR endpoint that has the [requestUri]. */
    private fun parAuthUrl(requestUri: String): String =
        URLBuilder(configuration.authorizationEndpoint).apply {
            parameters.append("request_uri", requestUri)
            parameters.append("client_id", config.clientId)
        }.buildString()

    /**
     * Pushes the authorization request and returns the authorization URL, see RFC 9126.
     * Prod: https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_par.html
     * Test: https://www.authelia.com/integration/openid-connect/introduction/#pushed-authorization-requests-endpoint
     */
    private suspend fun parRequest(
        parEndpoint: String,
        state: String,
        nonce: String,
        codeChallenge: String,
    ): Either<PushedAuthorizationError, String> =
        either {
            val response = Either.catch {
                http.submitForm(
                    parEndpoint,
                    Parameters.build {
                        append("response_type", "code")
                        append("client_id", config.clientId)
                        append("redirect_uri", config.redirectUrl)
                        append("scope", SCOPES)
                        append("state", state)
                        append("nonce", nonce)
                        append("acr_values", ACR_VALUES)
                        // TODO prompt is not formally supported by authelia
                        // https://github.com/authelia/authelia/issues/2596
                        // append("prompt", "login")
                        append("code_challenge", codeChallenge)
                        append("code_challenge_method", "S256")
                    },
                ) {
                    basicAuth(config.clientId, config.clientSecret)
                }
            }.mapLeft { PushedAuthorizationError("could not push authorization request: ${it.message}") }.bind()

            ensure(response.status == HttpStatusCode.Created) {
                PushedAuthorizationError("incorrect PAR response code: ${response.status}")
            }

            val par = Either.catch { json.decodeFromString<ParResponse>(response.bodyAsText()) }
                .mapLeft { PushedAuthorizationError("could not decode PAR response: ${it.message}") }
                .bind()

            parAuthUrl(par.requestUri)
        }

    companion object {
        /**
         * Reads the discovery document of the provider in [config] and creates the provider.
         * [hashKey] is the key used in HMAC hashing of the state and nonce.
         */
        suspend fun create(
            config: OidcConfig,
            hashKey: String,
            http: HttpClient = defaultHttpClient(),
        ): Either<DiscoveryError, OidcProvider> =
            either {
                val wellKnown = config.issuer.trimEnd('/') + "/.well-known/openid-configuration"

                logger.debug { "Fetching OIDC provider details from $wellKnown" }

                val response = Either.catch { http.get(wellKnown) }
                    .mapLeft { DiscoveryError("could not fetch OIDC provider details from $wellKnown: ${it.message}") }
                    .bind()

                ensure(response.status.isSuccess()) {
                    DiscoveryError("could not fetch OIDC provider details from $wellKnown: the endpoint responded with ${response.status}")
                }

                val configuration = Either.catch { json.decodeFromString<OpenidConfiguration>(response.bodyAsText()) }
                    .mapLeft { DiscoveryError("could not decode OIDC provider details: ${it.message}") }
                    .bind()

                logger.debug { "OIDC provider details fetched" }

                val jwks = Either.catch {
                    JwkProviderBuilder(URI(configuration.jwksUri).toURL())
                        .timeouts(OIDC_TIMEOUT_SECONDS * MILLIS_PER_SECOND, OIDC_TIMEOUT_SECONDS * MILLIS_PER_SECOND)
                        .build()
                }.mapLeft { DiscoveryError("invalid JWKS URI ${configuration.jwksUri}: ${it.message}") }.bind()

                OidcProvider(config, hashKey, configuration, http, jwks)
            }

        private const val MILLIS_PER_SECOND = 1000

        /** The HTTP client used to call the provider. Like for the other clients, the JVM proxy settings apply. */
        fun defaultHttpClient(): HttpClient = HttpClient(Apache5) {
            engine { customizeClient { useSystemProperties() } }
            install(HttpTimeout) { requestTimeoutMillis = OIDC_TIMEOUT_SECONDS * MILLIS_PER_SECOND.toLong() }
        }

        private val random = SecureRandom()

        /** A random PKCE code verifier, see RFC 7636. */
        private fun newCodeVerifier(): String = base64Url.encodeToString(ByteArray(CODE_VERIFIER_BYTES).also { random.nextBytes(it) })

        /** The S256 PKCE code challenge of the [codeVerifier]. */
        internal fun codeChallenge(codeVerifier: String): String =
            base64Url.encodeToString(MessageDigest.getInstance("SHA-256").digest(codeVerifier.toByteArray(Charsets.US_ASCII)))

        private fun formEncode(value: String): String = URLEncoder.encode(value, Charsets.UTF_8)
    }
}
