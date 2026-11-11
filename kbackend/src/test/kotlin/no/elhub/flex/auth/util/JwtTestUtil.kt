package no.elhub.flex.auth.util

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import java.util.Date

const val TEST_JWT_SECRET = "test-secret-key-at-least-256-bits-long-for-hs256"

@Suppress("MagicNumber")
fun makeJwt(
    role: String = "flex_service_provider",
    eid: String = "12345678901",
    scope: String = "use:data:controllable_unit:lookup",
    partyId: Int = 1,
    entityId: Int = 1,
    ttlSeconds: Long = 60,
): String =
    JWT.create()
        .withClaim("entity_id", entityId)
        .withClaim("eid", eid)
        .withClaim("party_id", partyId)
        .withClaim("role", role)
        .withClaim("scope", scope)
        .withExpiresAt(Date(System.currentTimeMillis() + ttlSeconds * 1000))
        .sign(Algorithm.HMAC256(TEST_JWT_SECRET))
