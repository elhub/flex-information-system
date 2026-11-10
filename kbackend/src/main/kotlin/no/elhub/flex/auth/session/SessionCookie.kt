package no.elhub.flex.auth.session

import io.ktor.http.Cookie
import io.ktor.server.application.ApplicationCall
import io.ktor.util.date.GMTDate
import no.elhub.flex.auth.plugin.SESSION_COOKIE_NAME

/** Sets the session cookie, which carries the signed access token of the user, on the response. */
fun ApplicationCall.setSessionCookie(accessToken: String, maxAgeSeconds: Int) {
    response.cookies.append(
        Cookie(
            name = SESSION_COOKIE_NAME,
            value = accessToken,
            maxAge = maxAgeSeconds,
            path = "/",
            secure = true,
            httpOnly = true,
            extensions = mapOf("SameSite" to "Strict"),
        ),
    )
}

/** Unsets the session cookie on the client. */
fun ApplicationCall.unsetSessionCookie() {
    response.cookies.append(
        Cookie(
            name = SESSION_COOKIE_NAME,
            value = "not.a.session",
            maxAge = 0,
            expires = GMTDate.START,
            path = "/",
            secure = true,
            httpOnly = true,
            extensions = mapOf("SameSite" to "Strict"),
        ),
    )
}
