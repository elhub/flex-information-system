package no.elhub.flex.util

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import java.util.Date

const val TEST_JWT_SECRET = "test-secret-key-at-least-256-bits-long-for-hs256"

@Suppress("MagicNumber")
fun makeJwt(
    role: String = "flex_service_provider",
    eid: String = "12345678901",
    scope: String = "use:data:controllable_unit:lookup",
): String =
    JWT.create()
        .withClaim("entity_id", 1)
        .withClaim("eid", eid)
        .withClaim("party_id", 1)
        .withClaim("role", role)
        .withClaim("scope", scope)
        .withExpiresAt(Date(System.currentTimeMillis() + 60_000))
        .sign(Algorithm.HMAC256(TEST_JWT_SECRET))
