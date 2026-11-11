package no.elhub.flex

import io.ktor.server.application.install
import io.ktor.server.plugins.autohead.AutoHeadResponse
import io.ktor.server.testing.TestApplication
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import no.elhub.flex.api.config.PostgrestConfig
import no.elhub.flex.api.config.RequireApiVersion
import no.elhub.flex.api.postgrest.PostgrestClient
import no.elhub.flex.api.routes.data.DATA_API_MOUNT_PATH
import no.elhub.flex.api.routes.data.dataApiRoutes
import no.elhub.flex.api.routes.notFoundRoute
import no.elhub.flex.auth.plugin.configureAuthentication
import no.elhub.flex.auth.util.TEST_JWT_SECRET
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureSerialization
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin

const val API_VERSION = "2026-06-08"

/** The data API of the backend, served in-process on top of the real [PostgrestTestContainer]. */
fun apiTestApplication(): TestApplication {
    val postgrest = PostgrestClient(PostgrestConfig(PostgrestTestContainer.baseUrl))
    return TestApplication {
        application {
            install(Tracing.plugin)
            install(AutoHeadResponse)
            configureSerialization()
            configureAuthentication(TEST_JWT_SECRET)
            install(RequireApiVersion) {
                pathPrefixes += DATA_API_MOUNT_PATH
                exemptSuffixes += "/download"
            }
            install(Koin) {
                modules(
                    module {
                        single<MeterRegistry> { SimpleMeterRegistry() }
                        single { postgrest }
                    },
                )
            }
            dataApiRoutes()
            notFoundRoute()
        }
    }
}
