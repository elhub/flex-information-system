package no.elhub.flex.auth.config

import io.ktor.server.config.ApplicationConfig
import io.ktor.server.config.getAs
import kotlinx.serialization.Serializable

/** Configuration of the auth package. */
@Serializable
data class AuthConfig(
    /** The HS256 secret used to sign and verify access tokens. */
    val jwtSecret: String,
)

fun ApplicationConfig.authConfig(): AuthConfig = property("auth").getAs()
