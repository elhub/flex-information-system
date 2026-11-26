package no.elhub.flex.auth.oidc

import arrow.core.Either
import arrow.core.raise.either
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.http.Cookie
import io.ktor.util.date.GMTDate
import java.util.Date

/** The path of the callback endpoint. */
const val CALLBACK_PATH = "/auth/v1/callback"

/** Name of the cookie that carries the state of the login between the login and the callback endpoints. */
const val LOGIN_COOKIE_NAME = "flex_login"

// We need to allow for slow logins, so we set a fairly long max age for the cookie
// Slow logins are typically on first user login (if they need to set up MFA etc in IDP)
// 10 minutes should be more than enough for that, and if the user takes longer than that,
// they can just try logging in again, which will set a new cookie.
private const val LOGIN_COOKIE_MAX_AGE_SECONDS = 600

/** The content of the login cookie: what the callback needs to know about the login that it finishes. */
data class LoginCookie(
    val authorizationDetails: AuthorizationDetails,
    val returnUrl: String,
) {
    /** Marshals and signs the [LoginCookie] to a [Cookie] that can be set on the redirect response of the login. */
    fun toCookie(jwtSecret: String): Cookie =
        Cookie(
            name = LOGIN_COOKIE_NAME,
            value = JWT.create()
                .withClaim("state", authorizationDetails.stateVerifier)
                .withClaim("nonce", authorizationDetails.nonceVerifier)
                .withClaim("code_verifier", authorizationDetails.codeVerifier)
                .withClaim("return_url", returnUrl)
                .withExpiresAt(Date(System.currentTimeMillis() + LOGIN_COOKIE_MAX_AGE_SECONDS * 1000L))
                // we don't really need to sign the cookie, but we are doing it just to make sure there is no tampering
                .sign(Algorithm.HMAC256(jwtSecret)),
            maxAge = LOGIN_COOKIE_MAX_AGE_SECONDS,
            path = CALLBACK_PATH,
            secure = true,
            httpOnly = true,
            // we need to set lax mode to allow the cookie to be sent when a user is navigating to the origin site from
            // an external site
            extensions = mapOf("SameSite" to "Lax"),
        )

    companion object {
        /** Reads the login cookie from its [value], and verifies the signature. */
        fun parse(value: String, jwtSecret: String): Either<LoginCookieError, LoginCookie> =
            either {
                val jwt = Either.catch { JWT.require(Algorithm.HMAC256(jwtSecret)).build().verify(value) }
                    .mapLeft { InvalidLoginCookieError(it.message ?: "the cookie could not be verified") }
                    .bind()

                fun claim(name: String) = jwt.getClaim(name).asString()
                    ?: raise(MalformedLoginCookieError("missing $name"))

                LoginCookie(
                    AuthorizationDetails(
                        claim("state"),
                        claim("nonce"),
                        claim("code_verifier"),
                    ),
                    claim("return_url"),
                )
            }

        /** The cookie that unsets the login cookie, for after the login. */
        fun unset(): Cookie =
            Cookie(
                name = LOGIN_COOKIE_NAME,
                value = "not.a.login",
                maxAge = 0,
                expires = GMTDate.START,
                path = CALLBACK_PATH,
                secure = true,
                httpOnly = true,
                extensions = mapOf("SameSite" to "Strict"),
            )
    }
}
