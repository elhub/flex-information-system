package no.elhub.flex.auth

import arrow.core.getOrElse
import kotlinx.coroutines.runBlocking
import no.elhub.flex.auth.config.AuthConfig
import no.elhub.flex.auth.oidc.OidcConfig
import no.elhub.flex.auth.oidc.OidcProvider
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

/** Koin module of the auth package: tokens, scopes, the authentication plugins and the auth API endpoints. */
@Module
@ComponentScan("no.elhub.flex.auth")
class AuthModule {

    /** Reads the discovery document of the identity provider at startup, so the application does not start if it is down. */
    @Single(createdAtStart = true)
    fun oidcProvider(config: OidcConfig, authConfig: AuthConfig): OidcProvider =
        runBlocking { OidcProvider.create(config, hashKey = authConfig.jwtSecret) }
            .getOrElse { error("Could not create the OIDC provider: ${it.message}") }
}
