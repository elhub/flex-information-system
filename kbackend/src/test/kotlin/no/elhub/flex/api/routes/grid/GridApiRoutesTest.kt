package no.elhub.flex.api.routes.grid

import com.github.tomakehurst.wiremock.WireMockServer
import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.absent
import com.github.tomakehurst.wiremock.client.WireMock.equalTo
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo
import com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.api.auth.FlexAuthentication
import no.elhub.flex.api.config.DocsConfig
import no.elhub.flex.api.config.PostgrestConfig
import no.elhub.flex.api.config.RequireApiVersion
import no.elhub.flex.api.config.Tracing
import no.elhub.flex.api.config.configureSerialization
import no.elhub.flex.api.postgrest.PostgrestClient
import no.elhub.flex.api.routes.data.DATA_API_MOUNT_PATH
import no.elhub.flex.api.routes.notFoundRoute
import no.elhub.flex.api.util.TEST_JWT_SECRET
import no.elhub.flex.api.util.makeJwt
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.io.File

class GridApiRoutesTest :
    FunSpec({
        val postgrest = WireMockServer(wireMockConfig().dynamicPort())
        lateinit var app: TestApplication

        fun token(scope: String = "read:grid") = makeJwt(role = "flex_organisation", scope = scope)

        beforeSpec {
            postgrest.start()
            val client = PostgrestClient(PostgrestConfig(postgrest.baseUrl()))
            val docs = GridApiDocs(DocsConfig("https://flex.test/"))
            app = TestApplication {
                application {
                    install(Tracing.plugin)
                    configureSerialization()
                    install(FlexAuthentication) { jwtSecret = TEST_JWT_SECRET }
                    install(RequireApiVersion) { pathPrefixes += DATA_API_MOUNT_PATH }
                    install(Koin) {
                        modules(
                            module {
                                single<MeterRegistry> { SimpleMeterRegistry() }
                                single { client }
                                single { docs }
                            },
                        )
                    }
                    gridApiDocsRoutes()
                    gridApiRoutes()
                    notFoundRoute()
                }
            }
        }

        afterSpec {
            app.stop()
            postgrest.stop()
        }

        beforeTest { postgrest.resetAll() }

        context("reading") {
            test("a list is read from the grid schema, without an Api-Version") {
                postgrest.stubFor(get(urlPathEqualTo("/line")).willReturn(aResponse().withBody("""[{"id":1}]""")))

                val response = app.client.get("/grid/v0/line?limit=1") { header("Authorization", "Bearer ${token()}") }

                response.status shouldBe HttpStatusCode.OK
                response.bodyAsText() shouldBe """[{"id":1}]"""
                response.headers["Api-Version"] shouldBe null
                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/line"))
                        .withQueryParam("limit", equalTo("1"))
                        .withHeader("Accept-Profile", equalTo("grid")),
                )
            }

            test("a single resource is requested as one object by id") {
                postgrest.stubFor(get(urlPathEqualTo("/substation_cluster")).willReturn(aResponse().withBody("""{"id":12}""")))

                val response = app.client.get("/grid/v0/substation_cluster/12") { header("Authorization", "Bearer ${token()}") }

                response.status shouldBe HttpStatusCode.OK
                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/substation_cluster"))
                        .withQueryParam("id", equalTo("eq.12"))
                        .withHeader("Accept", equalTo("application/vnd.pgrst.object+json"))
                        .withHeader("Accept-Profile", equalTo("grid")),
                )
            }

            test("embed becomes select") {
                postgrest.stubFor(get(urlPathEqualTo("/line")).willReturn(aResponse().withBody("[]")))

                app.client.get("/grid/v0/line?embed=from_substation_cluster") {
                    header("Authorization", "Bearer ${token(scope = "read:grid")}")
                }.status shouldBe HttpStatusCode.OK

                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/line"))
                        .withQueryParam("select", equalTo("*,from_substation_cluster(*)"))
                        .withQueryParam("embed", absent()),
                )
            }
        }

        context("substations") {
            test("ordering by proximity with coordinates uses the distance function, limited to 10 by default") {
                postgrest.stubFor(get(urlPathEqualTo("/rpc/substation_distance")).willReturn(aResponse().withBody("[]")))

                app.client.get("/grid/v0/substation?order=proximity&longitude=5.3234&latitude=60.3972") {
                    header("Authorization", "Bearer ${token()}")
                }.status shouldBe HttpStatusCode.OK

                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/rpc/substation_distance"))
                        .withQueryParam("order", absent())
                        .withQueryParam("limit", equalTo("10"))
                        .withQueryParam("longitude", equalTo("5.3234"))
                        .withQueryParam("latitude", equalTo("60.3972"))
                        .withHeader("Accept-Profile", equalTo("grid")),
                )
            }

            test("a limit given with proximity is kept") {
                postgrest.stubFor(get(urlPathEqualTo("/rpc/substation_distance")).willReturn(aResponse().withBody("[]")))

                app.client.get("/grid/v0/substation?order=proximity&longitude=5.3234&latitude=60.3972&limit=3") {
                    header("Authorization", "Bearer ${token()}")
                }.status shouldBe HttpStatusCode.OK

                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/rpc/substation_distance"))
                        .withQueryParam("limit", equalTo("3"))
                        .withQueryParam("longitude", equalTo("5.3234"))
                        .withQueryParam("latitude", equalTo("60.3972")),
                )
            }

            test("without proximity the table is read") {
                postgrest.stubFor(get(urlPathEqualTo("/substation")).willReturn(aResponse().withBody("[]")))

                app.client.get("/grid/v0/substation?order=id") {
                    header("Authorization", "Bearer ${token()}")
                }.status shouldBe HttpStatusCode.OK

                postgrest.verify(getRequestedFor(urlPathEqualTo("/substation")).withQueryParam("order", equalTo("id")))
            }
        }

        context("authorization") {
            test("the data scope does not give access to the grid") {
                val response = app.client.get("/grid/v0/line") { header("Authorization", "Bearer ${token(scope = "read:data")}") }

                response.status shouldBe HttpStatusCode.Forbidden
                response.headers["WWW-Authenticate"] shouldBe """Bearer error="insufficient_scope", scope="read:grid:line""""
                postgrest.allServeEvents.size shouldBe 0
            }

            test("an embedded resource needs its own scope") {
                val response = app.client.get("/grid/v0/line?embed=from_substation_cluster") {
                    header("Authorization", "Bearer ${token(scope = "read:grid:line")}")
                }

                response.status shouldBe HttpStatusCode.Forbidden
                response.headers["WWW-Authenticate"] shouldBe
                    """Bearer error="insufficient_scope", scope="read:grid:substation_cluster""""
            }
        }

        context("unknown routes") {
            test("are a JSON not found") {
                for (response in listOf(app.client.get("/grid/v0/nope"), app.client.post("/grid/v0/line"))) {
                    response.status shouldBe HttpStatusCode.NotFound
                    val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
                    body.getValue("code").jsonPrimitive.content shouldBe "HTTP404"
                }
                app.client.get("/grid/v0/nope").bodyAsText() shouldContain "Not Found: GET /grid/v0/nope"
                postgrest.allServeEvents.size shouldBe 0
            }
        }

        context("documentation") {
            test("serves the OpenAPI document with the public server URL") {
                val response = app.client.get("/grid/v0/openapi.json")

                response.status shouldBe HttpStatusCode.OK
                response.contentType()?.withoutParameters() shouldBe ContentType.Application.Json
                val served = Json.parseToJsonElement(response.bodyAsText()).jsonObject
                served.getValue("servers").jsonArray[0].jsonObject.getValue("url").jsonPrimitive.content shouldBe
                    "https://flex.test/grid/v0/"
                val original = Json.parseToJsonElement(File("grid/static/openapi.json").readText()).jsonObject
                served.getValue("paths") shouldBe original.getValue("paths")
            }

            test("serves the documentation page") {
                val response = app.client.get("/grid/v0/")

                response.status shouldBe HttpStatusCode.OK
                response.bodyAsText() shouldContain "<title>Flex Grid API</title>"
            }

            test("the path without a trailing slash redirects to the documentation page") {
                val response = app.createClient { followRedirects = false }.get("/grid/v0")

                response.status shouldBe HttpStatusCode.MovedPermanently
                response.headers["Location"] shouldBe "/grid/v0/"
            }
        }
    })
