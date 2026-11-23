package no.elhub.flex

import io.kotest.core.spec.style.FunSpec
import io.ktor.server.engine.EmbeddedServer
import io.ktor.server.netty.NettyApplicationEngine

/**
 * Base of the API tests: starts the application once per spec and exposes it as [api].
 * The tests are written in the constructor block, as in any Kotest spec. The application calls the accounting point
 * adapter only when [syncAccountingPoints] is set.
 */
abstract class ApiSpec(body: ApiSpec.() -> Unit, syncAccountingPoints: Boolean = false) : FunSpec() {
    private lateinit var server: EmbeddedServer<NettyApplicationEngine, NettyApplicationEngine.Configuration>
    lateinit var api: ApiClient

    init {
        beforeSpec {
            server = apiTestServer(syncAccountingPoints).also { it.start(wait = false) }
            val port = server.engine.resolvedConnectors().first().port
            api = ApiClient("http://127.0.0.1:$port")
        }
        afterSpec {
            if (::api.isInitialized) api.close()
            if (::server.isInitialized) server.stop()
        }
        body()
    }
}
