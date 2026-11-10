package no.elhub.flex.auth

import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Module

/** Koin module of the auth package: tokens, scopes, the authentication plugins and the auth API endpoints. */
@Module
@ComponentScan("no.elhub.flex.auth")
class AuthModule
