package no.elhub.flex

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.TestApplication
import no.elhub.flex.config.TraceInfo

class HealthCheckTest :
    FunSpec({
        lateinit var testApp: TestApplication

        beforeSpec {
            testApp = defaultTestApplication()
        }

        afterSpec {
            testApp.stop()
        }

        context("GET /healthz") {
            test("always HTTP 200") {
                val response = testApp.client.get("/healthz")
                response.status shouldBe HttpStatusCode.OK
            }

            test("well-formed traceresponse header in response") {
                val response = testApp.client.get("/healthz")

                val traceResponse = response.headers["traceresponse"]
                traceResponse.shouldNotBeNull()

                val traceInfo = TraceInfo.parse(traceResponse)
                traceInfo.shouldBeRight()
            }

            test("traceparent is taken into account") {
                val traceID = "4bf92f3577b34da6a3ce929d0e0e4736"

                val response = testApp.client.get("/healthz") {
                    header("traceparent", "00-$traceID-00f067aa0ba902b7-01")
                }
                response.status shouldBe HttpStatusCode.OK

                val traceInfo = response.headers["traceresponse"]!!.let { TraceInfo.parse(it) }
                traceInfo.shouldBeRight()

                traceInfo.getOrNull()!!.traceID shouldBe traceID
            }
        }
    })
