package no.elhub.flex.auth.oidc

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import java.util.Date

private const val SECRET = "a secret that is long enough for hs256"

private val loginCookie = LoginCookie(AuthorizationDetails("state-msg", "nonce-msg", "code-verifier"), "/#/entity/3/show")

private fun signed(secret: String = SECRET, expiresInSeconds: Long = 60, vararg claims: Pair<String, String>): String =
    JWT.create()
        .apply { claims.forEach { (name, value) -> withClaim(name, value) } }
        .withExpiresAt(Date(System.currentTimeMillis() + expiresInSeconds * 1000))
        .sign(Algorithm.HMAC256(secret))

private val allClaims = arrayOf("state" to "s", "nonce" to "n", "code_verifier" to "v", "return_url" to "/#/")

class LoginCookieTest : FunSpec({

    test("a cookie is read back with what was put in it") {
        LoginCookie.parse(loginCookie.toCookie(SECRET).value, SECRET).shouldBeRight() shouldBe loginCookie
    }

    test("the cookie is only sent to the callback endpoint, and is not readable by scripts") {
        val cookie = loginCookie.toCookie(SECRET)

        cookie.name shouldBe "flex_login"
        cookie.path shouldBe "/auth/v1/callback"
        cookie.maxAge shouldBe 600
        cookie.secure shouldBe true
        cookie.httpOnly shouldBe true
        cookie.extensions["SameSite"] shouldBe "Lax"
    }

    test("a cookie signed with another secret is invalid") {
        LoginCookie.parse(signed("another secret that is long enough", claims = allClaims), SECRET)
            .shouldBeLeft().shouldBeInstanceOf<InvalidLoginCookieError>()
    }

    test("a cookie that was tampered with is invalid") {
        val value = loginCookie.toCookie(SECRET).value

        LoginCookie.parse(value.substringBeforeLast('.') + ".AAAA", SECRET)
            .shouldBeLeft().shouldBeInstanceOf<InvalidLoginCookieError>()
    }

    test("an expired cookie is invalid") {
        LoginCookie.parse(signed(expiresInSeconds = -60, claims = allClaims), SECRET)
            .shouldBeLeft().shouldBeInstanceOf<InvalidLoginCookieError>()
    }

    test("something that is not a token is invalid") {
        LoginCookie.parse("not a token", SECRET).shouldBeLeft().shouldBeInstanceOf<InvalidLoginCookieError>()
    }

    listOf("state", "nonce", "code_verifier", "return_url").forEach { missing ->
        test("a cookie signed by us without $missing is malformed") {
            val claims = allClaims.filter { it.first != missing }.toTypedArray()

            LoginCookie.parse(signed(claims = claims), SECRET).shouldBeLeft() shouldBe MalformedLoginCookieError("missing $missing")
        }
    }

    test("the cookie that unsets the login cookie has the same path, and expires immediately") {
        val cookie = LoginCookie.unset()

        cookie.name shouldBe "flex_login"
        cookie.path shouldBe "/auth/v1/callback"
        cookie.maxAge shouldBe 0
    }
})
