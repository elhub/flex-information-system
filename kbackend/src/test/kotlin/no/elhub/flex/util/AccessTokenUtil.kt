package no.elhub.flex.util

import no.elhub.flex.auth.AccessToken
import java.util.Date

@Suppress("MagicNumber")
fun systemToken(
    role: String = "flex_service_provider",
    scope: List<String> = emptyList(),
    ttlSeconds: Long = 60,
): AccessToken = AccessToken(
    entityId = 1,
    extId = "0",
    partyId = 0,
    role = role,
    scope = scope,
    exp = Date(System.currentTimeMillis() + ttlSeconds * 1000L).time / 1000L,
)
