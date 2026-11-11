package no.elhub.flex

import io.kotest.core.spec.style.FunSpec
import io.ktor.server.testing.TestApplication

/**
 * Base of the API tests: starts the application once per spec and exposes it as [api].
 * The tests are written in the constructor block, as in any Kotest spec.
 */
abstract class ApiSpec(body: ApiSpec.() -> Unit) : FunSpec() {
    private lateinit var app: TestApplication
    lateinit var api: ApiClient

    init {
        beforeSpec {
            app = apiTestApplication().also { it.start() }
            api = ApiClient(app)
        }
        afterSpec { app.stop() }
        body()
    }
}
