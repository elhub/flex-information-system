package no.elhub.flex.auth.util

import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.token.AccessToken
import java.util.Date

@Suppress("MagicNumber")
fun systemToken(
    role: String = "flex_internal",
    scope: List<String> = emptyList(),
    ttlSeconds: Long = 60,
): AccessToken = AccessToken(
    entityId = 1,
    extId = "0",
    partyId = 0,
    role = role,
    scope = scope.mapNotNull { Scope.fromString(it) },
    exp = Date(System.currentTimeMillis() + ttlSeconds * 1000L).time / 1000L,
)
