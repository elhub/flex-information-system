package no.elhub.flex.auth.oidc

import io.ktor.server.config.ApplicationConfig
import io.ktor.server.config.getAs
import kotlinx.serialization.Serializable

/** Configuration of the OpenID Connect login with the external identity provider. */
@Serializable
data class OidcConfig(
    /** The issuer URL of the identity provider, from which the discovery document is read. */
    val issuer: String,
    val clientId: String,
    val clientSecret: String,
    /** The URL of the callback endpoint, as registered at the identity provider. */
    val redirectUrl: String,
    /** The URL where the user lands after the logout at the identity provider. */
    val postLogoutRedirectUrl: String,
)

fun ApplicationConfig.oidcConfig(): OidcConfig = property("oidc").getAs()
