package no.elhub.flex.config

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.server.application.install
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.testing.testApplication
import io.micrometer.prometheusmetrics.PrometheusConfig
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin

class MetricsTest :
    FunSpec({
        test("HTTP request latency is exposed as histogram buckets") {
            testApplication {
                application {
                    val registry = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)
                    install(Koin) {
                        modules(module { single { registry } })
                    }
                    configureMetrics()
                    routing { get("/ping") { call.respondText("pong") } }
                }

                client.get("/ping")
                val scrape = client.get("/metrics").bodyAsText()

                scrape shouldContain "ktor_http_server_requests_seconds_bucket"
            }
        }
    })
