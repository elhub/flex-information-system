package no.elhub.flex.auth.config

import io.ktor.server.config.ApplicationConfig
import io.ktor.server.config.getAs
import kotlinx.serialization.Serializable

/** Configuration of the auth package. */
@Serializable
data class AuthConfig(
    /** The HS256 secret used to sign and verify access tokens. */
    val jwtSecret: String,
    /** How long the access tokens issued to the portal at login are valid, in seconds. */
    val portalTokenSeconds: Long = 120,
    /**
     * How long the access tokens issued to API clients by the token endpoint are valid, in
     * seconds.
     */
    val apiTokenSeconds: Long = 600,
)

fun ApplicationConfig.authConfig(): AuthConfig = property("auth").getAs()
